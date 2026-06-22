import { Image, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Avatar({ uri, size = 50 }) {
  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={uri ? { uri } : require('../../assets/icon.png')}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: colors.lightBg,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
