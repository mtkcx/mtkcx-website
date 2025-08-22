import React from 'react';

function Products() {
  console.log('Products function component rendering');
  
  return React.createElement('div', {
    style: { 
      padding: '40px', 
      backgroundColor: '#ffffff', 
      minHeight: '100vh',
      color: '#000000',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { 
        fontSize: '32px', 
        marginBottom: '20px',
        color: '#000000'
      }
    }, 'PRODUCTS PAGE WORKING'),
    React.createElement('p', { 
      key: 'text',
      style: { 
        fontSize: '18px', 
        marginBottom: '20px',
        color: '#333333'
      }
    }, 'This page is now loading successfully!'),
    React.createElement('div', {
      key: 'box',
      style: {
        backgroundColor: '#e3f2fd',
        padding: '20px',
        border: '2px solid #2196f3',
        borderRadius: '8px',
        marginTop: '20px'
      }
    }, 'If you see this blue box, the routing and component are working correctly.')
  ]);
}

export default Products;