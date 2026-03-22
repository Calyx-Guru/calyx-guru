import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="personal-information/index"
        options={{
          title: 'Personal Information',
        }}
      />
      <Stack.Screen
        name="fortune-poems/index"
        options={{
          title: 'Fortune Poems',
        }}
      />
      <Stack.Screen
        name="fortune-poems/history"
        options={{
          title: 'Today Tellings',
        }}
      />
      <Stack.Screen
        name="feng-shui/index"
        options={{
          title: 'Feng Shui Compass',
        }}
      />
      <Stack.Screen
        name="palm-reading/index"
        options={{
          title: 'Palm Reading',
        }}
      />
    </Stack>
  );
}
