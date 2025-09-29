import React, { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);

  // fetch data sekali saja saat pertama kali mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resContacts = await fetch("http://localhost:5000/api/contacts");
        const contactsData = await resContacts.json();
        setContacts(Array.isArray(contactsData) ? contactsData : []);

        const resGroups = await fetch("http://localhost:5000/api/groups");
        const groupsData = await resGroups.json();
        setGroups(Array.isArray(groupsData) ? groupsData.filter(g => g && g.id) : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);


  const addContact = (newContact) => {
    setContacts((prev) => {
      if (prev.some(c => c.id === newContact.id)) return prev; // cek duplikat
      return [...prev, newContact];
    });
  };

  const updateContact = (updated) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const removeContact = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // helper untuk groups
  const addGroup = (newGroup) => {
    setGroups((prev) => [...prev, newGroup]);
  };

  const updateGroup = (updated) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updated.id ? updated : g))
    );
  };

  const removeGroup = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const setAllContacts = (contacts) => setContacts(contacts);
  const setAllGroups = (groups) => setGroups(groups);
  return (
    <DataContext.Provider
      value={{
        contacts, groups, addContact, updateContact,removeContact, addGroup, updateGroup, removeGroup, setAllContacts, setAllGroups
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
