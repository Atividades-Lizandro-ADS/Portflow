import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, radius } from '../../theme';

export default function TabSwitch({ options, active, onChange }) {
  return (
    <View style={styles.tabBar}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[styles.tabBtn, active === option.id && styles.tabActive]}
          onPress={() => onChange(option.id)}
        >
          <Text style={[styles.tabText, active === option.id && styles.tabTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: colors.formBg, borderRadius: radius.pill, overflow: 'hidden' },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.darkBg },
  tabText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: 'bold' },
  tabTextActive: { color: colors.white },
});
