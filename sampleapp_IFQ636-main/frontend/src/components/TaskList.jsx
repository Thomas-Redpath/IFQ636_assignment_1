import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import axiosInstance from '../axiosConfig';
import { productImages, productImageUrl } from './productImages';

const columns = [
  'ID',
  'Image',
  'Product',
  'Description',
  'Price',
  'Stock Number',
  'Status',
  'Actions',
];

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

const StockStatus = ({ stockNumber }) => {
  if (stockNumber == null || stockNumber === '') return '—';

  const inStock = Number(stockNumber) > 0;
  return (
    <Chip
      size="small"
      label={inStock ? 'In stock' : 'Out of stock'}
      color={inStock ? 'success' : 'error'}
    />
  );
};

const TaskList = ({ tasks, setTasks, token }) => {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const startEditing = (item) => {
    setError('');
    setDraft({
      id: item?._id ?? null,
      image: item?.image ?? '',
      title: item?.title ?? '',
      description: item?.description ?? '',
      price: item?.price ?? '',
      stockNumber: item?.stockNumber ?? '',
    });
  };

  const cancelEditing = () => {
    setDraft(null);
    setError('');
  };

const deleteProduct = async (item) => {
  if (draft || deletingId !== null) return;
  if (!window.confirm(`Delete "${item.title}"?`)) return;

  setDeletingId(item._id);
  setError('');

  try {
    await axiosInstance.delete(`/api/tasks/${item._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks((currentTasks) =>
      currentTasks.filter((product) => product._id !== item._id)
    );
  } catch (error) {
    setError(error.response?.data?.message || 'Failed to delete product.');
  } finally {
    setDeletingId(null);
  }
};

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!draft || saving) return;

    const title = draft.title.trim();
    if (!title) {
      setError('Enter a product name.');
      return;
    }

    const payload = {
      title,
      description: draft.description.trim(),
      image: draft.image,
      price: Number(draft.price),
      stockNumber: Number(draft.stockNumber),
    };

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    setSaving(true);
    setError('');

    try {
      const { data: product } = draft.id
        ? await axiosInstance.put(`/api/tasks/${draft.id}`, payload, config)
        : await axiosInstance.post('/api/tasks', payload, config);

      setTasks((currentTasks) =>
        draft.id
          ? currentTasks.map((item) => (item._id === draft.id ? product : item))
          : [product, ...currentTasks]
      );

      setDraft(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label) => ({
    name,
    'aria-label': label,
    form: 'inventory-product-form',
    value: draft[name],
    disabled: saving,
    onChange: (event) => {
      const { value } = event.target;
      setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
    },
    className: 'w-full rounded border p-2',
  });

  const editableRow = draft && (
    <TableRow key={draft.id ?? 'new-product'} sx={{ bgcolor: 'action.hover' }}>
      <TableCell>{draft.id ?? 'New'}</TableCell>

      <TableCell>
        <select {...field('image', 'Display image')}>
          <option value="">No image</option>

          {draft.image &&
            !productImages.some(({ filename }) => filename === draft.image) && (
              <option value={draft.image}>{draft.image}</option>
            )}

          {productImages.map(({ filename, label }) => (
            <option key={filename} value={filename}>
              {label}
            </option>
          ))}
        </select>
      </TableCell>

      <TableCell>
        <input {...field('title', 'Product name')} required autoFocus />
      </TableCell>

      <TableCell>
        <input {...field('description', 'Description')} />
      </TableCell>

      <TableCell sx={{ minWidth: 100 }}>
        <input
          {...field('price', 'Price in AUD')}
          type="number"
          min="0"
          step="0.01"
          required
        />
      </TableCell>

      <TableCell sx={{ minWidth: 100 }}>
        <input
          {...field('stockNumber', 'Stock number')}
          type="number"
          min="0"
          step="1"
          required
        />
      </TableCell>

      <TableCell>
        <StockStatus stockNumber={draft.stockNumber} />
      </TableCell>

      <TableCell>
        <form id="inventory-product-form" onSubmit={saveProduct}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" size="small" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>

            <Button type="button" size="small" disabled={saving} onClick={cancelEditing}>
              Cancel
            </Button>
          </Stack>
        </form>
      </TableCell>
    </TableRow>
  );

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Box sx={{ p: 2 }}>
        <Button variant="contained" disabled={Boolean(draft) || deletingId !== null} onClick={() => startEditing()}>
          Add product
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Table aria-label="Products" sx={{ minWidth: 950 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            {columns.map((column) => (
              <TableCell key={column} scope="col" sx={{ fontWeight: 700 }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {draft?.id === null && editableRow}

          {tasks.length === 0 && !draft && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                No products yet.
              </TableCell>
            </TableRow>
          )}

          {tasks.map((item) =>
            draft?.id === item._id ? (
              editableRow
            ) : (
              <TableRow key={item._id} hover>
                <TableCell>{item._id}</TableCell>

                <TableCell>
                  {item.image ? (
                    <Box
                      component="img"
                      src={productImageUrl(item.image)}
                      alt={item.title}
                      loading="lazy"
                      sx={{
                        display: 'block',
                        width: 48,
                        height: 48,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell component="th" scope="row">
                  {item.title}
                </TableCell>

                <TableCell>{item.description || '—'}</TableCell>

                <TableCell>
                  {item.price == null ? '—' : currencyFormatter.format(item.price)}
                </TableCell>

                <TableCell>{item.stockNumber ?? '—'}</TableCell>

                <TableCell>
                  <StockStatus stockNumber={item.stockNumber} />
                </TableCell>

           <TableCell>
  <Stack direction="row" spacing={1}>
    <Button
      size="small"
      aria-label={`Edit ${item.title}`}
      disabled={Boolean(draft) || deletingId !== null}
      onClick={() => startEditing(item)}
    >
      Edit
    </Button>

    <Button
      size="small"
      color="error"
      aria-label={`Delete ${item.title}`}
      disabled={Boolean(draft) || deletingId !== null}
      onClick={() => deleteProduct(item)}
    >
      {deletingId === item._id ? 'Deleting…' : 'Delete'}
    </Button>
  </Stack>
</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskList;