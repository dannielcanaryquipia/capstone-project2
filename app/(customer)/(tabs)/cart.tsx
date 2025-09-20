import { StyleSheet, Text, View } from 'react-native';
import Layout from '../../../constants/Layout';
import { useTheme } from '../../../contexts/ThemeContext';
import global from '../../../styles/global';

export default function CartScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Cart</Text>
      <Text style={{ color: colors.textSecondary }}>Your selected items will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: Layout.fontWeight.bold, fontFamily: Layout.fontFamily.bold, marginBottom: 8 },
});


