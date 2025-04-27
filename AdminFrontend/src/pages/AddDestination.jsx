import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const AddDestination = () => {
  const [destination, setDestination] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    location: '',
    rating: 5,
    featured: false
  });
  
  const [status, setStatus] = useState({
    message: '',
    type: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDestination({
      ...destination,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/destinations', destination);
      setStatus({
        message: 'Destination added successfully!',
        type: 'success'
      });
      // Reset form
      setDestination({
        name: '',
        description: '',
        imageUrl: '',
        price: '',
        location: '',
        rating: 5,
        featured: false
      });
    } catch (error) {
      setStatus({
        message: `Error: ${error.response?.data?.message || error.message}`,
        type: 'danger'
      });
    }
  };

  return (
    <Container className="mt-4">
      <h2>Add New Destination</h2>
      {status.message && (
        <Alert variant={status.type} dismissible onClose={() => setStatus({ message: '', type: '' })}>
          {status.message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Destination Name</Form.Label>
          <Form.Control 
            type="text" 
            name="name" 
            value={destination.name} 
            onChange={handleChange} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="description" 
            value={destination.description} 
            onChange={handleChange} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control 
            type="url" 
            name="imageUrl" 
            value={destination.imageUrl} 
            onChange={handleChange} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control 
            type="number" 
            name="price" 
            value={destination.price} 
            onChange={handleChange} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control 
            type="text" 
            name="location" 
            value={destination.location} 
            onChange={handleChange} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rating (1-5)</Form.Label>
          <Form.Control 
            type="number" 
            name="rating" 
            min="1" 
            max="5" 
            value={destination.rating} 
            onChange={handleChange} 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox" 
            label="Featured Destination" 
            name="featured" 
            checked={destination.featured} 
            onChange={handleChange} 
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Destination
        </Button>
      </Form>
    </Container>
  );
};

export default AddDestination;