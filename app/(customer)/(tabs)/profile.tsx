import { StyleSheet, Text, View } from 'react-native';
import Layout from '../../../constants/Layout';
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
  title: { fontSize: 24, fontWeight: Layout.fontWeight.bold, fontFamily: Layout.fontFamily.bold, marginBottom: 8 },
});


