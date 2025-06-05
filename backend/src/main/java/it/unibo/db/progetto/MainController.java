package it.unibo.db.progetto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MainController {

  final UtenteRepository utente;

  @GetMapping("/a1/eventoTest")
  public List<Utente> testEvento() {
    return utente.findAll();
  }

  @PostMapping("/login") // Maps POST requests to /api/login
  public ResponseEntity<Utente> loginUser(@RequestBody Map<String, String> body) {

    return utente.login(body);
  }
}

/*
 * Lato Front end fai le request e ti ritornano praticamente una mappa di
 * javascript
 * 
 * import React, { useState, useEffect } from 'react';
 * 
 * function UserList() {
 * const [users, setUsers] = useState([]);
 * const [loading, setLoading] = useState(true);
 * const [error, setError] = useState(null);
 * 
 * useEffect(() => {
 * // This function will be called after the component renders
 * // It's the ideal place for side effects like data fetching.
 * const fetchUsers = async () => {
 * try {
 * const response = await fetch('https://jsonplaceholder.typicode.com/users');
 * // Example API endpoint
 * if (!response.ok) { // Check for HTTP errors (e.g., 404, 500)
 * throw new Error(`HTTP error! status: ${response.status}`);
 * }
 * const data = await response.json(); // Parse the JSON response
 * setUsers(data); // Update state with fetched data
 * } catch (err) {
 * setError(err); // Catch network errors or errors thrown above
 * } finally {
 * setLoading(false); // Always set loading to false when done
 * }
 * };
 * 
 * fetchUsers(); // Call the async function
 * 
 * // Optional: cleanup function to cancel ongoing requests if the component
 * unmounts
 * // (More complex to implement purely with fetch, often involves
 * AbortController)
 * return () => {
 * // Cleanup logic if needed
 * };
 * }, []); // The empty dependency array [] means this effect runs only once
 * after the initial render
 * 
 * if (loading) {
 * return <div>Loading users...</div>;
 * }
 * 
 * if (error) {
 * return <div>Error: {error.message}</div>;
 * }
 * 
 * return (
 * <div>
 * <h2>User List</h2>
 * <ul>
 * {users.map(user => (
 * <li key={user.id}>{user.name} ({user.email})</li>
 * ))}
 * </ul>
 * </div>
 * );
 * }
 * 
 * export default UserList;
 */