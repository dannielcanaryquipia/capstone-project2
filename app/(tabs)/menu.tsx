import { StyleSheet, Text, View } from 'react-native';
import global from '../../styles/global';

export default function MenuScreen() {
  return (
    <View style={[global.screen, styles.center]}>
      <Text style={styles.title}>Menu</Text>
      <Text>Browse pizzas and sides.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
});


