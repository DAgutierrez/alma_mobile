import React from 'react';
import { 
  StatusBar, 
  Dimensions,
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  TextInput, 
  FlatList, 
  ScrollView,
  Image
} from 'react-native';

import {salesService} from '../../services/salesService';


import { AppRegistry } from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import {Card} from 'native-base';

import {productService} from '../../services/productService';

import _ from 'lodash';

import moment from 'moment';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

import ModalAddProduct from './components/ModalAddProduct';

import Toaster, { ToastStyles } from 'react-native-toaster';

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoaded: false,
      fontLoaded: false,
      isConected: true,
      products: [],
      soldProducts: [],
      modalVisible: false,
      productSelected: null,
      message: null
    };

    this.products= [];
    this.soldProducts = [];

    
  }

  async componentWillMount() {
    //this.setState({ isReady: true, fontLoaded: true });
  }



  async componentDidMount() {

    this.loadProducts();

  }

  async loadProducts () {
    this.setState({soldProducts: []});
    const response = await productService.getAll();
    this.products = response.data;

    const soldProducts = this.filterBySoldProducts(response.data);
    this.soldProducts = soldProducts;
    this.setState({soldProducts})
    this.setState({isLoaded: true})
  }

  filterBySoldProducts (products) {
   return _.filter(products, {'isSold': true})
  }

  componentWillUnmount() {
   
  }

  searchedProducts = (searchedText) => {
    if(searchedText.length > 0 ) {
      this.setState({soldProducts: []});

      const searchedProducts = this.products.filter(function(product) {
        return product.productName.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
      });
    
      if(searchedProducts.length > 0) {
        this.setState({soldProducts: searchedProducts});
      } else {
    
        this.setState({soldProducts: [{addProductButton: true}]});
      }
      
    } else  {
      this.setState({soldProducts: this.soldProducts});
    }
  
  };

  async updateProductIsSold (id) {
   this.state.products = [];
   const result = await productService.updateIsSold(id);
   this.loadProducts();
  }

  renderProducts = (product) => {
   
      return (
        <TouchableOpacity onPress={() => this.updateProductIsSold(product.id)}>
          <Card style={{flex: 1, padding: 10}}>
          <View>
            <Text style={{fontFamily: 'Roboto'}}>{product.productName}</Text>
          </View>
          </Card>
        </TouchableOpacity>
      );
   
  };

  saveSale (product) {
    const sale = {
      quantity: 1,
      salePriceGross: product.price,
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      productName: product.productName
    }

    salesService.create(sale);

    console.log('sale created!')
  }

  openAddProductModal (product) {
    console.log('product', product)
    if(product.um == 'gramos') {
      this.setState({productSelected: product })
      this.setState({modalVisible: true })
      if(!product.isSold) {
        this.updateProductIsSold(product.id);
      }
    } else {
      this.setState({message:{ text: '¡Producto Agregado!', duration: 500, styles: ToastStyles.success, onHide: () => { this.setState({message:null})} }})

      this.saveSale(product);
    }
  }

  renderCardProduct (product) {
    const cardWidth = screenWidth / 3.3;
    const cardHeight = screenHeight / 4;

    if(product.addProductButton ) {
      return (
        <Card><Text>Nuevo</Text></Card>
      );
    } else {
      //const productName = (product.imageUrl) ? product.productName.substring(0, 11) : product.productName;
      const productName = product.productName;
      const price = (product.um == 'gramos') ?  product.price * 1000 : product.price; 
      return (
        <TouchableOpacity  style={{width:cardWidth, height: cardHeight,  flex: 1, padding: 10, backgroundColor: 'white'}} onPress={() => this.openAddProductModal(product)}>
      
            {
              product.imageUrl ? (
                <View style={{flex:1, flexGrow: 10, justifyContent: 'center', alignItems: 'center'}}>
                  <Image  resizeMode="contain" source={{uri: product.imageUrl}} style={{ height: null,
                      width: '100%',flex: 1}}/>
                </View>   
              ) : null
            }
            
  
            <View style={{flexGrow: 2, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'Roboto', fontSize: 14}}>{productName}</Text>
            </View>

            <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'Roboto_thin', fontSize: 12}}>${price}</Text>
            </View>
        
        
        </TouchableOpacity>
      );
    }

    
  }

  closeModal() {
    this.setState({modalVisible: false})
  }



  render() {
    console.log('render', this.state.message);
    if(this.state.isLoaded) {
    
    return (
   

      <View style={styles.container}>

      
        <Toaster message={this.state.message} />
     

      
          <LinearGradient colors={['#4dd0e1', '#18ffff']} style={{flexDirection: 'row', flexGrow: 1}} start={[0, 0]} end={[0.6, 0]}></LinearGradient>
          <View style={{flexGrow: 8, padding: 10}}>

          <View style={{flexGrow: 1}}>
            <Card style={{flex: 1}}>
              <TextInput 
                style={styles.textinput}
                onChangeText={this.searchedProducts}
                placeholder="Busca tu producto Aqui" />
            </Card>
          </View>
       
    
      <View style={{flexGrow: 10}}>
        <ScrollView style={{height: 100}}>
          <FlatList
              data={this.state.soldProducts}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              renderItem={({item}) => this.renderCardProduct(item)} />
          </ScrollView>
      </View>


          </View>
          {
            this.state.productSelected ? (
              <ModalAddProduct closeModal={this.closeModal.bind(this)} product={this.state.productSelected} isVisible={this.state.modalVisible}></ModalAddProduct>
            ) : null
          }

         
      </View>
    )
  } else {
    return null;
  }

}

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  textinput: {
    flex: 1
  }
  
 
});

AppRegistry.registerComponent('App', () => App);
