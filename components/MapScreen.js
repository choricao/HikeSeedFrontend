import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform
} from 'react-native';
import { MapView } from 'expo';
import axios from 'axios';
import { Actions } from 'react-native-router-flux';
import { Location, Permissions } from 'expo';
import Moment from 'moment';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_APIKEY = 'AIzaSyC_NNhhIaGqjr9Ca-08_m3hv21SsfRDQvg';

export default class MapScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      // Default location is Bothell
      location: {
        latitude: 47.759953,
        longitude: -122.204483,
      },
      delta: {
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      hikes: [],
    }
  }

  componentDidMount = () => {
    this.getLocationAsync();
    axios.get('https://zc-hike-seed.herokuapp.com/hikes')
    .then((response) => {
      this.setState({
        hikes: response.data
      });
    })
    .catch((error) => {
      this.setState({
        message: error.message
      });
    });
  }

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    // Current Location is Ada in iOS simulator
    this.setState({
      location: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    });
  }

  renderHikeMarkers = () => {
    const hikeMarkers = this.state.hikes.map((hike, index) => {
      return (
        <MapView.Marker
          key={index}
          coordinate={{latitude: parseFloat(hike.lat), longitude: parseFloat(hike.lon)}}
          title={hike.name}
          description={`Distance: ${hike.distance} miles, Date: ${hike.date}`}
          onCalloutPress={() => Actions.hikeDetails({hike: hike})}
        />
      );
    });
    return hikeMarkers;
  }

  renderHikeRoutes = () => {
    const hikeRoutes = this.state.hikes.map((hike, index) => {
      let origin = {latitude: parseFloat(hike.origin_lat), longitude: parseFloat(hike.origin_lon)};
      let destination = {latitude: parseFloat(hike.lat), longitude: parseFloat(hike.lon)};

      return(
        <MapViewDirections
          key={index}
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          mode='walking'
          strokeWidth={1}
          strokeColor='purple'
          />
      );
    });
    return hikeRoutes;
  }

  render() {
    return (
      <View>
        <Text style={styles.header}>HIKE & SEED</Text>
        <MapView
          style={styles.map}
          region={{...this.state.location, ...this.state.delta}}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {this.renderHikeMarkers()}
          {this.renderHikeRoutes()}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  header: {
    ...Platform.select({
        ios: {
          fontFamily: 'Optima-Bold',
          paddingTop: '15%',
        },
        android: {
          fontFamily: 'sans-serif-medium',
          paddingTop: '10%',
        }
    }),
    fontSize: 30,
    color: 'orange',
    paddingBottom: 5,
    textAlign: 'center',
    backgroundColor: '#f0f2ef',
    width: '100%',
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  },
  map: {
    width: '100%',
		height: '100%',
  }
});
