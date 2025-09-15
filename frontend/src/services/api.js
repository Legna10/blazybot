// frontend/src/services/api.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export async function getContacts() { return (await fetch(`${BASE}/contacts`)).json(); }
export async function createContact(payload) { return (await fetch(`${BASE}/contacts`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) })).json(); }
export async function updateContact(id, payload) { return (await fetch(`${BASE}/contacts/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) })).json(); }
export async function deleteContact(id) { return (await fetch(`${BASE}/contacts/${id}`, { method:"DELETE" })).json(); }

export async function getGroups() { return (await fetch(`${BASE}/groups`)).json(); }
export async function createGroup(payload) { return (await fetch(`${BASE}/groups`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) })).json(); }
export async function updateGroup(id, payload) { return (await fetch(`${BASE}/groups/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) })).json(); }
export async function deleteGroup(id) { return (await fetch(`${BASE}/groups/${id}`, { method:"DELETE" })).json(); }

export async function addContactToGroup(groupId, contactId) { return (await fetch(`${BASE}/groups/${groupId}/contacts`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ contactId }) })).json(); }
export async function removeContactFromGroup(groupId, contactId) { return (await fetch(`${BASE}/groups/${groupId}/contacts/${contactId}`, { method:"DELETE" })).json(); }

export async function getLogs() { return (await fetch(`${BASE}/logs`)).json(); }
