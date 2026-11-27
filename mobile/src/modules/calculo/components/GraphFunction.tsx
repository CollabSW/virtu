import { Fragment, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export type GraphPoint = Readonly<{ x: number; y: number }>;

export type GraphInterval = Readonly<{ min: number; max: number }>;

export type GraphFunctionProps = {
  /** T15 output: each input segment is kept independent. */
  segments?: readonly (readonly GraphPoint[])[];
  /** T15 output: a sampled series; invalid values and jumps split its path. */
  points?: readonly GraphPoint[];
  /** Visible X bounds. A missing bound is inferred from the data. */
  domain?: GraphInterval;
  /** Visible Y bounds. If omitted, a finite, outlier-resistant range is inferred. */
  range?: GraphInterval;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  /** Human-readable expression used in the title and accessibility description. */
  expression?: string;
  showGrid?: boolean;
  loading?: boolean;
  error?: string | Error | null;
  emptyMessage?: string;
  height?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type IntervalResult = { min: number; max: number } | null;

const DEFAULT_HEIGHT = 300;
const LEFT_INSET = 52;
const RIGHT_INSET = 14;
const TOP_INSET = 18;
const BOTTOM_INSET = 38;
const GRAPH_LINE_LIGHT = '#2563EB';
const GRAPH_LINE_DARK = '#82B1FF';

function isGraphPoint(value: unknown): value is GraphPoint {
  if (typeof value !== 'object' || value === null) return false;
  const point = value as { x?: unknown; y?: unknown };
  return typeof point.x === 'number'
    && Number.isFinite(point.x)
    && typeof point.y === 'number'
    && Number.isFinite(point.y);
}

function getInputSegments(
  points?: readonly GraphPoint[],
  segments?: readonly (readonly GraphPoint[])[],
): readonly (readonly unknown[])[] {
  if (segments !== undefined) {
    return segments.filter((segment): segment is readonly GraphPoint[] => Array.isArray(segment));
  }
  return points === undefined ? [] : [points];
}

function flattenFinitePoints(inputSegments: readonly (readonly unknown[])[]): GraphPoint[] {
  return inputSegments.flatMap(segment => segment.filter(isGraphPoint));
}

function getExplicitBounds(
  interval: GraphInterval | undefined,
  minimum: number | undefined,
  maximum: number | undefined,
) {
  return {
    min: minimum ?? interval?.min,
    max: maximum ?? interval?.max,
  };
}

function expandConstantInterval(value: number): GraphInterval {
  const padding = Math.max(Math.abs(value) * 0.1, 1);
  return { min: value - padding, max: value + padding };
}

function deriveInterval(
  dataMinimum: number,
  dataMaximum: number,
  requestedMinimum?: number,
  requestedMaximum?: number,
): IntervalResult {
  let min = requestedMinimum ?? dataMinimum;
  let max = requestedMaximum ?? dataMaximum;
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(max - min)) return null;
  if (requestedMinimum === undefined && requestedMaximum === undefined && min === max) {
    return expandConstantInterval(min);
  }
  if (min >= max) return null;
  return { min, max };
}

function percentile(values: number[], fraction: number): number {
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor((ordered.length - 1) * fraction)];
}

function deriveAutomaticYRange(points: GraphPoint[]): GraphInterval | null {
  if (points.length === 0) return null;
  let min = points[0].y;
  let max = points[0].y;
  points.forEach(point => {
    min = Math.min(min, point.y);
    max = Math.max(max, point.y);
  });
  const magnitudes = points.map(point => Math.abs(point.y));
  const largestMagnitude = magnitudes.reduce((largest, value) => Math.max(largest, value), 0);
  const typicalMagnitude = percentile(magnitudes, 0.9);

  if (typicalMagnitude > 0 && largestMagnitude > typicalMagnitude * 4) {
    if (min < 0 && max > 0) {
      min = Math.max(min, -typicalMagnitude);
      max = Math.min(max, typicalMagnitude);
    } else if (max > 0) {
      max = Math.min(max, typicalMagnitude);
    } else {
      min = Math.max(min, -typicalMagnitude);
    }
  }

  if (min === max) return expandConstantInterval(min);
  const padding = (max - min) * 0.06;
  return { min: min - padding, max: max + padding };
}

function splitAtDiscontinuities(
  inputSegments: readonly (readonly unknown[])[],
  xRange: GraphInterval,
  yRange: GraphInterval,
): GraphPoint[][] {
  const output: GraphPoint[][] = [];
  const ySpan = yRange.max - yRange.min;
  const xSpan = xRange.max - xRange.min;

  inputSegments.forEach(input => {
    let current: GraphPoint[] = [];
    const finish = () => {
      if (current.length > 1) output.push(current);
      current = [];
    };

    input.forEach(value => {
      if (!isGraphPoint(value)
        || value.x < xRange.min
        || value.x > xRange.max
        || value.y < yRange.min
        || value.y > yRange.max) {
        finish();
        return;
      }

      const previous = current[current.length - 1];
      if (previous) {
        const yJump = Math.abs(value.y - previous.y);
        const xStep = Math.abs(value.x - previous.x);
        const jumpLimit = Math.max(ySpan * 0.55, ySpan * (xStep / xSpan) * 4);
        if (yJump > jumpLimit) finish();
      }
      current.push(value);
    });

    finish();
  });

  return output;
}

function niceStep(span: number, targetTickCount: number): number {
  const rawStep = span / Math.max(targetTickCount, 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

function createTicks(min: number, max: number, targetTickCount: number): number[] {
  const step = niceStep(max - min, targetTickCount);
  const first = Math.ceil(min / step);
  const last = Math.floor(max / step);
  const ticks: number[] = [];
  for (let index = first; index <= last && ticks.length < 20; index += 1) {
    const value = Number((index * step).toPrecision(12));
    ticks.push(Object.is(value, -0) ? 0 : value);
  }
  return ticks;
}

function formatTick(value: number): string {
  if (value === 0) return '0';
  return Number(value.toPrecision(4)).toString();
}

function getErrorMessage(error: string | Error | null | undefined): string | null {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message;
  return message.trim() || 'No se pudo representar la gráfica.';
}

export default function GraphFunction({
  segments,
  points,
  domain,
  range,
  xMin,
  xMax,
  yMin,
  yMax,
  expression,
  showGrid = true,
  loading = false,
  error,
  emptyMessage = 'No hay puntos para mostrar en esta gráfica.',
  height = DEFAULT_HEIGHT,
  accessibilityLabel,
  style,
}: GraphFunctionProps) {
  const theme = useTheme();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const inputSegments = useMemo(
    () => getInputSegments(points, segments),
    [points, segments],
  );
  const dataPoints = useMemo(() => flattenFinitePoints(inputSegments), [inputSegments]);
  const explicitX = getExplicitBounds(domain, xMin, xMax);
  const explicitY = getExplicitBounds(range, yMin, yMax);
  const externalError = getErrorMessage(error);

  const graph = useMemo(() => {
    if (dataPoints.length === 0) return null;
    const dataXRange = dataPoints.reduce(
      (bounds, point) => ({
        min: Math.min(bounds.min, point.x),
        max: Math.max(bounds.max, point.x),
      }),
      { min: dataPoints[0].x, max: dataPoints[0].x },
    );
    const xRange = deriveInterval(dataXRange.min, dataXRange.max, explicitX.min, explicitX.max);
    if (!xRange) return null;

    const yCandidates = dataPoints.filter(point => point.x >= xRange.min && point.x <= xRange.max);
    const automaticY = deriveAutomaticYRange(yCandidates.length ? yCandidates : dataPoints);
    if (!automaticY) return null;
    const yRange = deriveInterval(
      automaticY.min,
      automaticY.max,
      explicitY.min,
      explicitY.max,
    );
    if (!yRange) return null;

    return {
      xRange,
      yRange,
      paths: splitAtDiscontinuities(inputSegments, xRange, yRange),
    };
  }, [dataPoints, explicitX.max, explicitX.min, explicitY.max, explicitY.min, inputSegments]);

  const boundsAreInvalid = (
    (explicitX.min !== undefined && (!Number.isFinite(explicitX.min)
      || (explicitX.max !== undefined && explicitX.min >= explicitX.max)))
    || (explicitX.max !== undefined && !Number.isFinite(explicitX.max))
    || (explicitX.min !== undefined && explicitX.max !== undefined
      && !Number.isFinite(explicitX.max - explicitX.min))
    || (explicitY.min !== undefined && (!Number.isFinite(explicitY.min)
      || (explicitY.max !== undefined && explicitY.min >= explicitY.max)))
    || (explicitY.max !== undefined && !Number.isFinite(explicitY.max))
    || (explicitY.min !== undefined && explicitY.max !== undefined
      && !Number.isFinite(explicitY.max - explicitY.min))
  );
  const graphIsInvalid = !boundsAreInvalid && dataPoints.length > 0 && graph === null;

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setMeasuredWidth(previous => (previous === width ? previous : width));
  };

  const title = expression ? `Gráfica de ${expression}` : 'Gráfica cartesiana';
  const imageLabel = accessibilityLabel ?? title;
  const plotWidth = measuredWidth - LEFT_INSET - RIGHT_INSET;
  const plotHeight = height - TOP_INSET - BOTTOM_INSET;
  const xTicks = useMemo(
    () => graph && plotWidth > 0 ? createTicks(graph.xRange.min, graph.xRange.max, Math.max(2, Math.floor(plotWidth / 58))) : [],
    [graph, plotWidth],
  );
  const yTicks = useMemo(
    () => graph && plotHeight > 0 ? createTicks(graph.yRange.min, graph.yRange.max, 5) : [],
    [graph, plotHeight],
  );

  const darkMode = theme.background === '#000000';
  const graphColor = darkMode ? GRAPH_LINE_DARK : GRAPH_LINE_LIGHT;
  const axisColor = theme.text;
  const gridColor = theme.textSecondary;
  const plotLeft = LEFT_INSET;
  const plotRight = measuredWidth - RIGHT_INSET;
  const plotTop = TOP_INSET;
  const plotBottom = height - BOTTOM_INSET;
  const xToSvg = useCallback((x: number) => plotLeft
    + ((x - (graph?.xRange.min ?? 0)) / ((graph?.xRange.max ?? 1) - (graph?.xRange.min ?? 0))) * plotWidth,
  [graph, plotLeft, plotWidth]);
  const yToSvg = useCallback((y: number) => plotBottom
    - ((y - (graph?.yRange.min ?? 0)) / ((graph?.yRange.max ?? 1) - (graph?.yRange.min ?? 0))) * plotHeight,
  [graph, plotBottom, plotHeight]);
  const xAxisY = graph
    ? graph.yRange.min <= 0 && graph.yRange.max >= 0 ? yToSvg(0) : plotBottom
    : plotBottom;
  const yAxisX = graph
    ? graph.xRange.min <= 0 && graph.xRange.max >= 0 ? xToSvg(0) : plotLeft
    : plotLeft;
  const renderedPaths = useMemo(() => graph?.paths.map(path => path.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command}${xToSvg(point.x).toFixed(2)},${yToSvg(point.y).toFixed(2)}`;
  }).join(' ')) ?? [], [graph, xToSvg, yToSvg]);
  const isShowingChart = !loading
    && !externalError
    && !boundsAreInvalid
    && !graphIsInvalid
    && Boolean(graph && graph.paths.length > 0)
    && plotWidth > 0
    && plotHeight > 0;

  return (
    <View
      testID="graph-container"
      onLayout={onLayout}
      style={[styles.container, style]}
      accessible={isShowingChart}
      accessibilityRole={isShowingChart ? 'image' : undefined}
      accessibilityLabel={isShowingChart ? imageLabel : undefined}
    >
      {expression ? <Text style={[styles.title, { color: theme.text }]}>{title}</Text> : null}
      {loading ? (
        <View style={[styles.state, { minHeight: height }]}>
          <ActivityIndicator accessibilityLabel="Cargando gráfica" color={graphColor} />
          <Text style={[styles.stateText, { color: theme.text }]}>Cargando gráfica…</Text>
        </View>
      ) : externalError || boundsAreInvalid || graphIsInvalid ? (
        <View
          accessibilityRole="alert"
          style={[styles.state, { minHeight: height }]}
        >
          <Text style={[styles.stateText, { color: theme.text }]}>
            {externalError ?? (boundsAreInvalid
              ? 'El intervalo de la gráfica no es válido.'
              : 'No se pudo representar la gráfica con los datos recibidos.')}
          </Text>
        </View>
      ) : !graph || graph.paths.length === 0 ? (
        <View style={[styles.state, { minHeight: height }]}>
          <Text style={[styles.stateText, { color: theme.text }]}>{emptyMessage}</Text>
        </View>
      ) : measuredWidth <= LEFT_INSET + RIGHT_INSET || plotHeight <= 0 ? (
        <View style={{ height }} />
      ) : (
        <Svg
          width={measuredWidth}
          height={height}
          viewBox={`0 0 ${measuredWidth} ${height}`}
          testID="graph-svg"
          accessible={false}
        >
          {showGrid && xTicks.map(tick => (
            <Line
              key={`grid-x-${tick}`}
              testID="graph-grid-line"
              x1={xToSvg(tick)}
              x2={xToSvg(tick)}
              y1={plotTop}
              y2={plotBottom}
              stroke={gridColor}
              strokeOpacity={0.22}
              strokeWidth={1}
            />
          ))}
          {showGrid && yTicks.map(tick => (
            <Line
              key={`grid-y-${tick}`}
              testID="graph-grid-line"
              x1={plotLeft}
              x2={plotRight}
              y1={yToSvg(tick)}
              y2={yToSvg(tick)}
              stroke={gridColor}
              strokeOpacity={0.22}
              strokeWidth={1}
            />
          ))}
          <Line
            testID="graph-x-axis"
            x1={plotLeft}
            x2={plotRight}
            y1={xAxisY}
            y2={xAxisY}
            stroke={axisColor}
            strokeWidth={1.5}
          />
          <Line
            testID="graph-y-axis"
            x1={yAxisX}
            x2={yAxisX}
            y1={plotTop}
            y2={plotBottom}
            stroke={axisColor}
            strokeWidth={1.5}
          />
          {graph.xRange.min <= 0 && graph.xRange.max >= 0
            && graph.yRange.min <= 0 && graph.yRange.max >= 0 ? (
              <Circle
                testID="graph-origin"
                cx={xToSvg(0)}
                cy={yToSvg(0)}
                r={3}
                fill={axisColor}
              />
            ) : null}
          {xTicks.map(tick => (
            <Fragment key={`tick-x-${tick}`}>
              <Line
                x1={xToSvg(tick)}
                x2={xToSvg(tick)}
                y1={xAxisY - 4}
                y2={xAxisY + 4}
                stroke={axisColor}
                strokeWidth={1}
              />
              <SvgText
                testID="graph-x-tick-label"
                x={xToSvg(tick)}
                y={plotBottom + 23}
                fill={theme.textSecondary}
                fontSize={14}
                textAnchor="middle"
              >
                {formatTick(tick)}
              </SvgText>
            </Fragment>
          ))}
          {yTicks.map(tick => (
            <Fragment key={`tick-y-${tick}`}>
              <Line
                x1={yAxisX - 4}
                x2={yAxisX + 4}
                y1={yToSvg(tick)}
                y2={yToSvg(tick)}
                stroke={axisColor}
                strokeWidth={1}
              />
              <SvgText
                testID="graph-y-tick-label"
                x={plotLeft - 8}
                y={yToSvg(tick) + 5}
                fill={theme.textSecondary}
                fontSize={14}
                textAnchor="end"
              >
                {formatTick(tick)}
              </SvgText>
            </Fragment>
          ))}
          <SvgText
            x={plotRight - 2}
            y={plotTop + 14}
            fill={theme.text}
            fontSize={14}
            textAnchor="end"
          >
            x
          </SvgText>
          <SvgText
            x={plotLeft - 10}
            y={plotTop + 8}
            fill={theme.text}
            fontSize={14}
            textAnchor="end"
          >
            y
          </SvgText>
          {renderedPaths.map((path, index) => (
            <Path
              key={`curve-${index}`}
              testID="graph-curve-segment"
              d={path}
              fill="none"
              stroke={graphColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  stateText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
