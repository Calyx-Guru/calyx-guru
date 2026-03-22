import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="SignUp"
        options={{
          title: 'Sign Up',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="SignIn"
        options={{
          title: 'Sign In',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
