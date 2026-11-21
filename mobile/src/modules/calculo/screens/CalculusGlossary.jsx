import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { Button } from '@/shared/components/Button';
import { ThemedText } from '@/components/themed-text';
import { GlossaryScreen } from '@/shared/features/glossary/screens/GlossaryScreen';
import { APP_SLUG } from '@/config/apiConfig';

export default function CalculusGlossary({ close }) {
  const { request } = useAuth();
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    request(`/glosarios/${APP_SLUG}`).then(data => {
      if (!Array.isArray(data)) throw new Error('El servidor devolvió un glosario inválido.');
      const values = data.map(item => ({
        id: String(item.id), subject: APP_SLUG, title: item.titulo,
        definition: item.definicion, topic: item.tematica, rendering: item.renderizacion,
      }));
      if (active) setEntries(values);
    }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [request, retry]);
  return <View style={{ gap: 12 }}>
    <Button title="Volver a Cálculo" onPress={close} />
    {error ? <><ThemedText accessibilityRole="alert">{error}</ThemedText>
      <Button title="Reintentar glosario" onPress={() => { setError(''); setRetry(value => value + 1); }} /></>
      : !entries ? <ActivityIndicator accessibilityLabel="Cargando glosario" />
        : <GlossaryScreen entries={entries} subject="calculo" title="Glosario de Cálculo" />}
  </View>;
}
