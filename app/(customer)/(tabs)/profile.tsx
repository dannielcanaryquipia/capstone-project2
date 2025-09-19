import { StyleSheet, Text, View } from 'react-native';
import global from '../../../styles/global';

export default function ProfileScreen() {
  return (
    <View style={[global.screen, styles.center]}>
      <Text style={styles.title}>Profile</Text>
      <Text>Manage your account details here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
});


