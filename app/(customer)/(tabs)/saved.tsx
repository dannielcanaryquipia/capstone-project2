import { StyleSheet, Text, View } from 'react-native';
import Layout from '../../../constants/Layout';
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
  title: { fontSize: 24, fontWeight: Layout.fontWeight.bold, fontFamily: Layout.fontFamily.bold, marginBottom: 8 },
});


