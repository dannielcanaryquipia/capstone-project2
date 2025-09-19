import { StyleSheet, Text, View } from 'react-native';
import global from '../../../styles/global';

export default function SavedScreen() {
  return (
    <View style={[global.screen, styles.center]}>
      <Text style={styles.title}>Saved</Text>
      <Text>Your saved items will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
});


