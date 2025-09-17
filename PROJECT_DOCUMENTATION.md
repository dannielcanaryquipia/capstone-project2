# Food Delivery Mobile Application

A modern cross-platform mobile application for food delivery built with React Native, Expo, and Supabase. The app supports multiple user roles including customers, delivery personnel, and administrators.

## Features

- **Multi-role Authentication**
  - Customer accounts for ordering food
  - Delivery personnel accounts for order fulfillment
  - Admin accounts for restaurant management
  - Secure authentication with Supabase Auth

- **User Experience**
  - Clean, intuitive interface
  - Dark/Light theme support
  - Responsive design for various screen sizes
  - Smooth navigation with expo-router

- **Technical Stack**
  - React Native with TypeScript
  - Expo for cross-platform development
  - Supabase for backend services (Auth, Database)
  - React Navigation for routing
  - React Native Paper for UI components
  - React Query for data fetching and caching
  - Zustand for state management

## Project Structure

```
.
├── app/                     # Main application routes and screens
│   ├── (admin)/            # Admin-specific screens
│   ├── (auth)/             # Authentication screens (sign-in, sign-up, etc.)
│   ├── (customer)/         # Customer-specific screens
│   ├── (delivery)/         # Delivery personnel screens
│   └── (tabs)/             # Main tab navigation
├── assets/                 # Images, fonts, and other static assets
├── components/             # Reusable UI components
│   └── ui/                 # Base UI components (Button, Input, etc.)
├── constants/              # Application constants and strings
├── contexts/               # React contexts
│   ├── AuthContext.tsx     # Authentication context
│   └── ThemeContext.tsx    # Theme management
├── database/               # Database schemas and types
├── hooks/                  # Custom React hooks
├── lib/                    # Third-party library configurations
├── services/               # API and service integrations
└── styles/                 # Global styles and themes
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing on physical devices)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd capstone-project2
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

5. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app (Android) or Camera app (iOS)

## Development

### Available Scripts

- `npm start` or `yarn start` - Start the development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

### Code Style

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Keep components small and focused
- Use meaningful variable and function names
- Add appropriate comments for complex logic

## Deployment

### Building for Production

1. Create a production build:
   ```bash
   npx expo prebuild
   ```

2. Build for specific platforms:
   - iOS: `npx expo run:ios`
   - Android: `npx expo run:android`

### App Store / Play Store

Follow the Expo documentation for publishing to app stores:
- [iOS App Store](https://docs.expo.dev/distribution/app-stores/)
- [Google Play Store](https://docs.expo.dev/distribution/uploading-apps/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- UI Components from [React Native Paper](https://callstack.github.io/react-native-paper/)
- State Management with [Zustand](https://github.com/pmndrs/zustand)
- Data Fetching with [React Query](https://tanstack.com/query/latest)
