import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, ZoomControl } from 'react-leaflet';
import { Dimensions, StyleSheet, View, useColorScheme } from 'react-native';

import { locationList } from '../../LocationList';

// Fix leaflet's default icon issue with webpack and React Native / Expo web
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon using a common marker icon URL
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const mapHeight = Dimensions.get('window').height;

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Flatten all store locations from locationList
  const allStores = locationList.flatMap(location => location.stores);

  // Default center to first store or fallback coordinates
  const center = allStores.length > 0 ? [allStores[0].point[0], allStores[0].point[1]] : [49.2827, -123.1207];

  // Map tile URL and attribution for dark/light mode
  // Temporarily use OpenStreetMap standard tiles for testing background visibility
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <MapContainer
        center={center}
        zoom={13}
        style={styles.map}
        zoomControl={false} // disable default zoom control to reposition
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        {allStores.map((store, index) => {
          // Validate point array and fallback to default coordinates if invalid
          let position: [number, number] | undefined = undefined;
          if (
            Array.isArray(store.point) &&
            store.point.length === 2 &&
            typeof store.point[0] === 'number' &&
            typeof store.point[1] === 'number'
          ) {
            position = [store.point[0], store.point[1]] as [number, number];
          }
          if (!position) {
            return null; // Skip marker if position is invalid
          }
          return (
            <Marker key={index} position={position as unknown as [number, number]} icon={customIcon}>
              <Popup>
                <div style={isDark ? styles.popupDark : styles.popup}>
                  <strong>{store.name}</strong><br />
                  {store.address}<br />
                  {store.hours}
                </div>
              </Popup>
            </Marker>
          );
        })}
        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" />
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  map: {
    height: mapHeight,
    width: '100%',
  },
  popup: {
    fontSize: 14,
    lineHeight: 18,
    color: '#000',
  },
  popupDark: {
    fontSize: 14,
    lineHeight: 18,
    color: '#fff',
  },
});
