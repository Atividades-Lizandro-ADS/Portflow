import { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius } from '../theme';
import EmbedLoader from './EmbedLoader';

export default function YoutubeEmbed({ videoId, width }) {
  const [loading, setLoading] = useState(true);
  const height = width * 9 / 16;

  return (
    <View style={{ height, borderRadius: radius.card, overflow: 'hidden' }}>
      {loading && <EmbedLoader />}
      <WebView
        source={{ uri: `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0` }}
        style={{ flex: 1, backgroundColor: colors.lightBg }}
        onLoadEnd={() => setLoading(false)}
        allowsFullscreenVideo
        javaScriptEnabled
      />
    </View>
  );
}
