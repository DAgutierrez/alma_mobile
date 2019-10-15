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
  Image,
  InputAccessoryView,
  Keyboard,
  SafeAreaView,
  Button
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

import KeyboardAccessory from 'react-native-sticky-keyboard-accessory';
import { isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';

import { Container, Header, Content, List, ListItem } from 'native-base';
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
      message: null,
      productFinderVisible: false
    };

    this.products= [];
    this.soldProducts = [];

    
  }

  async componentWillMount() {
    //this.setState({ isReady: true, fontLoaded: true });
  }



  async componentDidMount() {

    this.loadProducts();

    this.keyboardShowListener = Keyboard.addListener('keyboardDidShow', (e) => this.keyboardShow(e));
    this.keyboardHideListener = Keyboard.addListener('keyboardDidHide', (e) => this.keyboardHide(e));

  }

  keyboardShow(e) {
    console.log('show keyboard')
    // this.setState({
    //   
    // });
    this.setState({
      productFinderVisible: true,
      bottom: isIphoneX() ? (e.endCoordinates.height - getBottomSpace()) : e.endCoordinates.height
    });
  }
  
  keyboardHide(e) {

    // this.setState({
    //   productFinderVisible:false
    // });
    this.setState({
      productFinderVisible: false,
      bottom: 0
    });
  }

  async loadProducts () {
    this.setState({soldProducts: []});
    const response = await productService.getAll();
    this.products = this.filterByProductsWithImage(response.data);

    let soldProducts = this.filterBySoldProducts(response.data);
    soldProducts = this.filterByProductsWithImage(response.data);

    this.soldProducts = soldProducts;
    this.setState({soldProducts})
    this.setState({isLoaded: true})
  }

  filterBySoldProducts (products) {
   return _.filter(products, {'isSold': true})
  }

  filterByProductsWithImage (products) {
    return _.filter(products, (product) => {
      return product.imageUrl;
    })
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
    console.log('save sale!')
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
    const cardWidth = screenWidth / 6;
    const cardHeight = screenHeight / 10;


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
                <View style={{flex:1, flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <Image  resizeMode="contain" source={{uri: product.imageUrl}} style={{ height: null,
                      width: '100%',flex: 1}}/>
                </View>   
              ) : null
            }
            
  
            {/* <View style={{flexGrow: 2, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'Roboto', fontSize: 14}}>{productName}</Text>
            </View>

            <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontFamily: 'Roboto_thin', fontSize: 12}}>${price}</Text>
            </View> */}
        
        
        </TouchableOpacity>
      );
    }

    
  }

  closeModal() {
    this.setState({modalVisible: false})
  }

  renderProductList () {
    return (
    // <ScrollView style={{flex: 1}}>
      <FlatList
          data={this.state.soldProducts}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => this.renderCardProduct(item)} />
    // </ScrollView>
    )
    
  }



  render() {
    const inputAccessoryViewID = "uniqueID";

    if(this.state.isLoaded) {
    
    return (
   

      <View style={styles.container}>

     
     
          {/* <KeyboardAccessory>
            {this.renderProductList()}
          </KeyboardAccessory> */}

          {/* <KeyboardAccessoryView alwaysVisible={true}>
         
          </KeyboardAccessoryView> */}
      
      

        {/* <InputAccessoryView style={{backgroundColor: 'white'}} backgroundColor={'#fff'} nativeID={inputAccessoryViewID}> */}
          
          {/* <View style={{flex:1, backgroundColor: 'white', flexDirection: 'column'}}>
            <View style={{flex:1, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <Text>$1500</Text>
            </View>
            <View style={{flex:1, backgroundColor: 'white', flexDirection: 'row'}}>
              <TouchableOpacity style={{flex:1, backgroundColor: '#000',  justifyContent: 'center', alignItems: 'center', padding: 10}}>
                 <Text>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1, backgroundColor: 'yellow', justifyContent: 'center', alignItems: 'center', padding: 10  }}>
                  <Text>Vender</Text>
              </TouchableOpacity>
            </View>
          </View> */}
          {/* <Button
            onPress={() => this.setState({text: 'Placeholder Text'})}
            title="Reset Text"
          /> */}
        {/* </InputAccessoryView> */}

      
        <Toaster message={this.state.message} />
    
          <LinearGradient colors={['#4dd0e1', '#18ffff']} style={{flexDirection: 'row', flexGrow: 1}} start={[0, 0]} end={[0.6, 0]}></LinearGradient>
          <View style={{flexGrow: 8, padding: 10}}>

          <View style={{flexGrow: 1}}>
            <Card style={{flex: 1}}>
              <TextInput 
                style={styles.textinput}
                onChangeText={this.searchedProducts}
                placeholder="Busca tu producto Aqui"
                 />
            </Card>
          </View>

          <View style={{flexGrow: 10}}>
              
          </View>
          {/* {
            this.state.productFinderVisible ? (
              <View style={{height: 100,flexGrow: 1, marginBottom: 370}}>
                {this.renderProductList()}
              </View>
            ) : null
          } */}
    
          


          </View>
          {
            this.state.productSelected ? (
              <ModalAddProduct closeModal={this.closeModal.bind(this)} product={this.state.productSelected} isVisible={this.state.modalVisible}></ModalAddProduct>
            ) : null
          }



<KeyboardAccessory >
    <View style={styles.textInputView}>


    {
            this.state.productFinderVisible ? (
            

            <View  style={{flexDirection: 'row'}}
                        >
              {
                this.state.soldProducts.map((item) => (
        
                  <View style={{ height: screenHeight / 8}}>
                       {this.renderCardProduct(item)}
                  </View>
                 
                ))
              }
            </View>
  
           
            ) : null
          }
    </View>

        
        </KeyboardAccessory>
         
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
  },
  textInputView: {
    flex: 1
  },
  textInput: {
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#CCC',
    padding: 10,
    fontSize: 16,
    marginRight: 10,
    textAlignVertical: 'top'
  },
  textInputButton: {
    flexShrink: 1,
  }
  
 
});

AppRegistry.registerComponent('App', () => App);
