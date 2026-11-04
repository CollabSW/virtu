import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
} from 'expo-router/ui';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import type { ReactNode } from 'react';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/config/theme';

export default function AppNavigator() {
  return Platform.OS === 'web' ? <WebTabs /> : <NativeTabs />;
}

function NativeTabs() {
  // The native tab module is required only in the native branch, not evaluated by web.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { NativeTabs: TabsComponent } = require('expo-router/unstable-native-tabs') as typeof import('expo-router/unstable-native-tabs');
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme ?? 'light'];

  return (
    <TabsComponent
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <TabsComponent.Trigger name="index">
        <TabsComponent.Trigger.Label>Home</TabsComponent.Trigger.Label>
        <TabsComponent.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </TabsComponent.Trigger>
      <TabsComponent.Trigger name="explore">
        <TabsComponent.Trigger.Label>Explore</TabsComponent.Trigger.Label>
        <TabsComponent.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </TabsComponent.Trigger>
      {__DEV__ && (
        <TabsComponent.Trigger name="pruebas">
          <TabsComponent.Trigger.Label>Pruebas</TabsComponent.Trigger.Label>
        </TabsComponent.Trigger>
      )}
    </TabsComponent>
  );
}

function WebTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
          {__DEV__ && (
            <TabTrigger name="pruebas" href="/pruebas" asChild>
              <TabButton>Pruebas</TabButton>
            </TabTrigger>
          )}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}
      >
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps & { children?: ReactNode }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme ?? 'light'];
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>Expo Starter</ThemedText>
        {props.children}
        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: { marginRight: 'auto' },
  pressed: { opacity: 0.7 },
  tabButtonView: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.three, borderRadius: Spacing.three },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
