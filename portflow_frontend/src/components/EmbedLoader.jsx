import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function EmbedLoader() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.bg]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lightBg },
});
