'use client'
import { Box, Stack, Typography, Button, Modal, TextField,Card, CardContent, IconButton, Paper } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, doc, setDoc, getDocs, query, deleteDoc, getDoc } from "firebase/firestore";
import { use, useEffect, useState } from "react";
import { Fira_Sans, Gajraj_One } from "next/font/google";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleUpdateOpen = (name, count) => {
    setCurrentItem({ name, count });
    setUpdateOpen(true);
  };
  const handleUpdateClose = () => setUpdateOpen(false);
  const [itemName, setItemName] = useState('')
  const [itemCount, setItemCount] = useState(1);
  const [currentItem, setCurrentItem] = useState({ name: '', count: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const [pantry, setPantry] = useState([])
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({ "name": doc.id, ...doc.data() })
    })
    console.log(pantryList)
    setPantry(pantryList)
  }


  useEffect(() => {

    updatePantry()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      await setDoc(docRef, { count: count + 1 })
    }
    else {
      await setDoc(docRef, { count: 1 })
    }
    await updatePantry()
  }

  const updateItem = async (item, newCount) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await setDoc(docRef, { count: newCount });
    await updatePantry();
    handleUpdateClose();
  }

  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      if (count === 1) {
        await deleteDoc(docRef)
      }
      else {
        await setDoc(docRef, { count: count - 1 })
      }
      await updatePantry()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      p={4}
      bgcolor="#f5f5f5"
    >
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="Item Name" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <Button variant="contained" color="primary" onClick={() => { addItem(itemName); handleClose(); }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={updateOpen} onClose={handleUpdateClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Item
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="New Count" type="number" variant="outlined" value={itemCount} onChange={(e) => setItemCount(e.target.value)} />
            <Button variant="contained" color="primary" onClick={() => { updateItem(currentItem.name, itemCount); }}>Update</Button>
          </Stack>
        </Box>
      </Modal>
      <TextField 
        label="Search" 
        variant="outlined" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, width: '300px' }}
      />
      <Button variant="contained" color="primary" onClick={handleOpen}>Add Item</Button>
      <Box width="100%" display="flex" justifyContent="center" flexDirection="column" alignItems="center" mt={2}>
        <Box width="80%" mb={2}>
          <Typography variant="h3" textAlign="center" gutterBottom>Pantry</Typography>
        </Box>
        <Stack width="80%" spacing={2}>
          {filteredPantry.length > 0 ? (
            filteredPantry.map(({ name, count }) => (
              <Card key={name} variant="outlined" sx={{ bgcolor: '#ffffff', borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1">Quantity: {count}</Typography>
                      <IconButton color="primary" onClick={() => addItem(name)}>
                        <AddCircleOutline />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => removeItem(name)}>
                        <RemoveCircleOutline />
                      </IconButton>

                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="h6" color="textSecondary" textAlign="center">No items found</Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

