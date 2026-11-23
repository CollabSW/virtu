import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useMatiasDesign } from './matiasDesign';

export default function ProgressOverview({ units, onHistory, onOpenLesson }) {
  const design = useMatiasDesign();
  const lessons = units.flatMap(unit => unit.lecciones);
  const studied = lessons.filter(lesson => lesson.estado === 'ESTUDIADO').length;
  const completedUnits = units.filter(unit => unit.estadoUnidad === 'ESTUDIADO').length;
  const quizzes = lessons.filter(lesson => lesson.tieneCuestionario
    && Number.isInteger(lesson.cuestionarioId) && lesson.cuestionarioId > 0);
  const text = { color: design.text, fontFamily: design.regular };
  const muted = { color: design.muted, fontFamily: design.regular };
  const heading = { color: design.text, fontFamily: design.semibold };

  return <View style={styles.page}>
    <Card style={[styles.summary, { backgroundColor: design.surface }]}>
      <View style={styles.summaryHeading}>
        <View style={styles.grow}>
          <ThemedText style={muted}>Lecciones estudiadas</ThemedText>
          <ThemedText style={[styles.total, { color: design.primary, fontFamily: design.bold }]}>{studied} / {lessons.length}</ThemedText>
          <ThemedText style={muted}>Estado registrado en Cálculo</ThemedText>
        </View>
        <View style={[styles.summaryIcon, { backgroundColor: design.subtle }]}>
          <Image source={require('../../../../assets/figma/matias/trend.svg')} contentFit="contain" style={{ width: 22, height: 17 }} accessible={false} />
        </View>
      </View>
      <View style={styles.metrics}>
        <View style={[styles.metric, { backgroundColor: design.subtle }]}>
          <ThemedText style={muted}>Unidades estudiadas</ThemedText>
          <ThemedText style={[styles.metricValue, heading]}>{completedUnits} de {units.length}</ThemedText>
        </View>
        <View style={[styles.metric, { backgroundColor: design.subtle }]}>
          <ThemedText style={muted}>Lecciones pendientes</ThemedText>
          <ThemedText style={[styles.metricValue, heading]}>{lessons.filter(lesson => lesson.estado === 'PENDIENTE').length}</ThemedText>
        </View>
      </View>
    </Card>

    <ThemedText accessibilityRole="header" style={[styles.sectionTitle, heading]}>Unidades curriculares</ThemedText>
    {!units.length && <ThemedText style={muted}>Aún no hay unidades disponibles.</ThemedText>}
    {units.map((unit, index) => <Card key={unit.id} style={[styles.unit, { backgroundColor: design.surface }]}>
      <View style={styles.unitHeading}>
        <View style={[styles.unitIcon, { backgroundColor: unit.estadoUnidad === 'ESTUDIADO' ? design.successSurface : design.subtle }]}>
          <Image source={unit.estadoUnidad === 'ESTUDIADO'
            ? require('../../../../assets/figma/matias/complete.svg')
            : require('../../../../assets/figma/matias/pending.svg')}
            style={{ width: 16.667, height: 16.667 }} contentFit="contain" accessible={false} />
        </View>
        <View style={styles.grow}>
          <ThemedText style={muted}>Unidad {index + 1} · {unit.estadoUnidad}</ThemedText>
          <ThemedText style={[styles.unitTitle, heading]}>{unit.titulo}</ThemedText>
        </View>
      </View>
      {unit.lecciones.map(lesson => <View key={lesson.id} style={[styles.lesson, { borderColor: design.subtle }]}>
        <ThemedText style={text}>{lesson.titulo}</ThemedText>
        <ThemedText style={{ color: lesson.estado === 'ESTUDIADO' ? design.success : design.muted, fontFamily: design.semibold }}>{lesson.estado}</ThemedText>
        <Button title="Abrir lección" accessibilityLabel={`Abrir ${lesson.titulo}`} onPress={() => onOpenLesson(lesson.id)}
          style={[styles.button, { backgroundColor: design.subtle }]} textStyle={heading} />
      </View>)}
    </Card>)}

    <ThemedText accessibilityRole="header" style={[styles.sectionTitle, heading]}>Historial de intentos</ThemedText>
    <ThemedText style={muted}>Consulta los resultados oficiales de cada lección.</ThemedText>
    {!quizzes.length && <ThemedText style={muted}>Aún no hay cuestionarios disponibles para consultar.</ThemedText>}
    {quizzes.map(lesson => <Card key={lesson.id} style={[styles.unit, { backgroundColor: design.surface }]}>
      <ThemedText style={[styles.unitTitle, heading]}>{lesson.titulo}</ThemedText>
      <Button title="Ver historial" accessibilityLabel={`Ver historial de ${lesson.titulo}`} onPress={() => onHistory(lesson)}
        style={[styles.button, { backgroundColor: design.subtle }]} textStyle={{ color: design.primary, fontFamily: design.semibold }}
        icon={<Image source={require('../../../../assets/figma/matias/history-arrow.svg')} style={{ width: 10.667, height: 10.667 }} contentFit="contain" accessible={false} />} />
    </Card>)}
  </View>;
}

const styles = StyleSheet.create({
  page: { gap: 12 },
  summary: { borderRadius: 12, padding: 20, gap: 16 },
  summaryHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  summaryIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  total: { fontSize: 36, lineHeight: 44 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flex: 1, minWidth: 110, borderRadius: 8, padding: 8, gap: 4 },
  metricValue: { fontSize: 20, lineHeight: 28 },
  sectionTitle: { fontSize: 18, lineHeight: 26, marginTop: 8 },
  unit: { borderRadius: 12, padding: 16, gap: 12 },
  unitHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, minWidth: 0 },
  unitTitle: { fontSize: 18, lineHeight: 26 },
  lesson: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  button: { minHeight: 48, paddingVertical: 8, borderRadius: 8 },
});
