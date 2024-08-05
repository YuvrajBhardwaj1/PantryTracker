'use client';
import { Box, Stack, Typography, Button, Modal, TextField, Card, CardContent, IconButton, Grid } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, doc, setDoc, getDocs, query, deleteDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Inter, Rubik } from "next/font/google";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

// Font Styles
const inter = Inter({ subsets: ['latin'], weight: '400' });
const rubik = Rubik({ subsets: ['latin'], weight: '400' });

// Modal Styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
  bgcolor: '#fff',
  borderRadius: 2,
  boxShadow: 3,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

// Main Container Style
const containerStyle = {
  background: `
  radial-gradient(circle at top left, rgba(255, 150, 150, 0.4), rgba(255, 150, 150, 0.2)),
  radial-gradient(circle at bottom right, rgba(150, 255, 150, 0.4), rgba(150, 255, 150, 0.2)),
  radial-gradient(circle at top right, rgba(150, 150, 255, 0.4), rgba(150, 150, 255, 0.2)),
  radial-gradient(circle at bottom left, rgba(255, 255, 150, 0.4), rgba(255, 255, 150, 0.2))
`,
backgroundSize: 'cover',
height: '100vh',
p: 4
};

// Card Styles
const cardStyle = {
  bgcolor: '#ffffff',
  borderRadius: 8,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
};

// Button Styles
const buttonStyle = {
  borderRadius: '20px',
};

// Heading Style
const headingStyle = {
  fontFamily: rubik.style.fontFamily,
  fontWeight: 700,
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

  const [pantry, setPantry] = useState([]);
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ "name": doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
    await updatePantry();
  };

  const updateItem = async (item, newCount) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await setDoc(docRef, { count: newCount });
    await updatePantry();
    handleUpdateClose();
  };

  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
      await updatePantry();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={containerStyle}
    >
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={headingStyle}>
            Add Item
          </Typography>
          <Stack direction="column" spacing={2}>
            <TextField label="Item Name" variant="outlined" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            <Button variant="contained" color="primary" sx={buttonStyle} onClick={() => { addItem(itemName); handleClose(); }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={updateOpen} onClose={handleUpdateClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={headingStyle}>
            Update Item
          </Typography>
          <Stack direction="column" spacing={2}>
            <TextField label="New Count" type="number" variant="outlined" value={itemCount} onChange={(e) => setItemCount(e.target.value)} />
            <Button variant="contained" color="primary" sx={buttonStyle} onClick={() => { updateItem(currentItem.name, itemCount); }}>Update</Button>
          </Stack>
        </Box>
      </Modal>
      <TextField 
        label="Search" 
        variant="outlined" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, width: '100%', maxWidth: '400px' }}
      />
      <Button variant="contained" color="primary" sx={buttonStyle} onClick={handleOpen}>Add Item</Button>
      <Box width="100%" display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h3" textAlign="center" gutterBottom sx={headingStyle}>
          Pantry
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {filteredPantry.length > 0 ? (
            filteredPantry.map(({ name, count }) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
                <Card variant="outlined" sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center" mt={2}>
                      <IconButton color="primary" onClick={() => addItem(name)}>
                        <AddCircleOutline />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => removeItem(name)}>
                        <RemoveCircleOutline />
                      </IconButton>
                    </Stack>
                    <Typography variant="body1" mt={1}>Quantity: {count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="h6" color="textSecondary" textAlign="center">No items found</Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
