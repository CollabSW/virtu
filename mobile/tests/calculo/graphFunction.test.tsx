import { fireEvent, render } from '@testing-library/react-native';
import type { ComponentProps, ReactNode } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import GraphFunction from '@/modules/calculo/components/GraphFunction';
import type { GraphPoint } from '@/modules/calculo/components/GraphFunction';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { Text: NativeText, View: NativeView } = require('react-native');
  const createView = (name: string) => function MockSvgElement({
    children,
    testID,
    ...props
  }: { children?: ReactNode; testID?: string }) {
    return React.createElement(NativeView, { ...props, testID: testID ?? name }, children);
  };
  return {
    __esModule: true,
    default: createView('svg'),
    Circle: createView('circle'),
    Line: createView('line'),
    Path: createView('path'),
    Text: function MockSvgText({ children, ...props }: { children?: ReactNode }) {
      return React.createElement(NativeText, props, children);
    },
  };
});

async function renderGraph(props: ComponentProps<typeof GraphFunction>) {
  const result = await render(<GraphFunction {...props} />);
  await fireEvent(result.getByTestId('graph-container'), 'layout', {
    nativeEvent: { layout: { width: 360, height: 320, x: 0, y: 0 } },
  });
  return result;
}

function sampleFunction(evaluate: (x: number) => number): GraphPoint[] {
  return Array.from({ length: 41 }, (_, index) => {
    const x = -2 + index * 0.1;
    return { x, y: evaluate(x) };
  });
}

describe('GraphFunction', () => {
  it.each([
    ['parábola', 'x²', (x: number) => x * x],
    ['seno', 'sin(x)', Math.sin],
  ])('renders a continuous %s curve as one path', async (_name, expression, evaluate) => {
    const { getByTestId, getAllByTestId } = await renderGraph({
      expression,
      points: sampleFunction(evaluate),
      domain: { min: -2, max: 2 },
    });

    expect(getByTestId('graph-svg')).toBeTruthy();
    expect(getAllByTestId('graph-curve-segment')).toHaveLength(1);
  });

  it('splits the reciprocal curve at its vertical asymptote', async () => {
    const { getAllByTestId } = await renderGraph({
      expression: '1/x',
      points: sampleFunction(x => 1 / x),
      domain: { min: -2, max: 2 },
    });

    const paths = getAllByTestId('graph-curve-segment');
    expect(paths).toHaveLength(2);
    const pathXs = paths.map(path => {
      const positions = path.props.d.match(/[ML]([\d.]+),/g) ?? [];
      return positions.map((position: string) => Number(position.slice(1, -1)));
    });
    expect(Math.max(...pathXs[0])).toBeLessThan(199);
    expect(Math.min(...pathXs[1])).toBeGreaterThan(199);
    paths.forEach(path => {
      expect(path.props.d).not.toContain('NaN');
      expect(path.props.d).not.toContain('Infinity');
    });
  });

  it('keeps evaluator-provided segments separate and draws axes, ticks, and optional grid', async () => {
    const segments = [
      [{ x: -2, y: 4 }, { x: -1, y: 1 }, { x: 0, y: 0 }],
      [{ x: 0.1, y: 0.01 }, { x: 1, y: 1 }, { x: 2, y: 4 }],
    ];
    const { getAllByTestId, getByText, queryAllByTestId } = await renderGraph({
      expression: 'x²',
      segments,
      domain: { min: -2, max: 2 },
      range: { min: 0, max: 4 },
    });

    expect(getAllByTestId('graph-curve-segment')).toHaveLength(2);
    expect(getAllByTestId('graph-x-axis')).toHaveLength(1);
    expect(getAllByTestId('graph-y-axis')).toHaveLength(1);
    expect(getAllByTestId('graph-x-tick-label').length).toBeGreaterThan(1);
    expect(getAllByTestId('graph-y-tick-label').length).toBeGreaterThan(1);
    expect(getByText('x')).toBeTruthy();
    expect(getByText('y')).toBeTruthy();
    expect(getAllByTestId('graph-grid-line').length).toBeGreaterThan(0);
    expect(queryAllByTestId('graph-origin')).toHaveLength(1);
  });

  it('allows the grid to be disabled and marks the origin when both intervals include zero', async () => {
    const { getAllByTestId, queryAllByTestId } = await renderGraph({
      points: sampleFunction(x => x * x),
      domain: { min: -2, max: 2 },
      range: { min: -1, max: 5 },
      showGrid: false,
    });

    expect(queryAllByTestId('graph-grid-line')).toHaveLength(0);
    expect(getAllByTestId('graph-origin')).toHaveLength(1);
  });

  it('renders loading, empty, and error states clearly', async () => {
    const empty = await renderGraph({ points: [] });
    expect(empty.getByText('No hay puntos para mostrar en esta gráfica.')).toBeTruthy();
    await empty.unmount();

    const loading = await renderGraph({ loading: true });
    expect(loading.getByLabelText('Cargando gráfica')).toBeTruthy();
    await loading.unmount();

    const error = await renderGraph({ error: 'No se pudo evaluar la función.' });
    expect(error.getByText('No se pudo evaluar la función.')).toBeTruthy();
  });

  it('exposes an accessible chart label and rejects invalid intervals without crashing', async () => {
    const graph = await renderGraph({
      expression: 'sin(x)',
      points: sampleFunction(Math.sin),
      domain: { min: 2, max: 2 },
      accessibilityLabel: 'Gráfica de seno entre menos dos y dos',
    });

    expect(graph.getByText('El intervalo de la gráfica no es válido.')).toBeTruthy();
    await graph.unmount();

    const valid = await renderGraph({
      expression: 'sin(x)',
      points: sampleFunction(Math.sin),
      accessibilityLabel: 'Gráfica de seno',
    });
    expect(valid.getByLabelText('Gráfica de seno')).toBeTruthy();
  });

  it('splits the flat points series on invalid and extreme values', async () => {
    const points = [
      { x: -2, y: 1 },
      { x: -1, y: 2 },
      { x: 0, y: Number.POSITIVE_INFINITY },
      { x: 1, y: -2 },
      { x: 2, y: -1 },
    ];
    const { getAllByTestId } = await renderGraph({
      points,
      domain: { min: -2, max: 2 },
      range: { min: -3, max: 3 },
    });

    expect(getAllByTestId('graph-curve-segment')).toHaveLength(2);
  });
});
