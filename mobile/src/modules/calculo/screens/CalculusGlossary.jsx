
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { Button } from '@/shared/components/Button';
import { ThemedText } from '@/components/themed-text';
import { GlossaryScreen } from '@/shared/features/glossary/screens/GlossaryScreen';
import { APP_SLUG } from '@/config/apiConfig';

function normalizarEntradas(data) {
  if (!Array.isArray(data)) {
    throw new Error('El servidor devolvió un glosario inválido.');
  }

  return data.map((item) => ({
    id: String(item.id),
    subject: APP_SLUG,
    title: String(item.titulo || 'Sin título'),
    definition: item.definicion || '',
    topic: item.tematica || '',
    rendering: item.renderizacion || '',
  }));
}

export default function CalculusGlossary({ close }) {
  const { request } = useAuth();

  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const cargarGlosario = useCallback(
    async (texto) => {
      const endpoint = `/glosarios/${APP_SLUG}`;
      const busqueda = texto.trim();
      const url = busqueda
        ? `${endpoint}?q=${encodeURIComponent(busqueda)}`
        : endpoint;

      const data = await request(url);
      return normalizarEntradas(data);
    },
    [request]
  );

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      if (!active) return;

      setLoading(true);
      setError('');

      try {
        const resultado = await cargarGlosario(query);

        if (active) {
          setEntries(resultado);
        }
      } catch (err) {
        if (active) {
          setEntries([]);
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el glosario.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, query.trim() ? 350 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, retry, cargarGlosario]);

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <Button title="Volver a Cálculo" onPress={close} />
      </View>

      <GlossaryScreen
        entries={entries}
        subject="calculo"
        title="Glosario de Cálculo"
        query={query}
        onQueryChange={setQuery}
        loading={loading}
        error={error}
        onRetry={() => setRetry((v) => v + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    padding: 12,
  },
});
