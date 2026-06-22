import { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius } from '../theme';
import EmbedLoader from './EmbedLoader';

export default function SketchfabEmbed({ modelId }) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ height: 380, borderRadius: radius.card, overflow: 'hidden' }}>
      {loading && <EmbedLoader />}
      <WebView
        source={{ uri: `https://sketchfab.com/models/${modelId}/embed` }}
        style={{ flex: 1, backgroundColor: colors.lightBg }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
      />
    </View>
  );
}
