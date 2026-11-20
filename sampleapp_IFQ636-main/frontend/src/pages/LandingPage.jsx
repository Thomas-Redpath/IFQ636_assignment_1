import { useEffect, useState } from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import axiosInstance from '../axiosConfig';
import { productImageUrl } from '../components/productImages';

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const { data } = await axiosInstance.get('/api/tasks/catalog');
        if (active) setProducts(data);
      } catch {
        if (active) setError('The catalogue is unavailable. Try refreshing the page.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '80vh',
        bgcolor: '#f6f6f6',
        px: { xs: 2, md: 3, lg: 4 },
        pt: { xs: 4, md: 6 },
        pb: 8,
      }}
    >
      <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 3 }}>
<Typography
  component="h1"
  sx={{
    fontSize: { xs: 28, md: 44 },
    fontWeight: 900,
    lineHeight: 1.1,
  }}
>
  Melbourne Sports Supporter Caps
</Typography>

        {!loading && !error && (
          <Typography color="text.secondary">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </Typography>
        )}
      </Stack>

      {loading && <Typography role="status">Loading products…</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && products.length === 0 && (
        <Typography>No products have been added yet.</Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: { xs: 3, md: 4 },
        }}
      >
        {products.map((product) => (
          <Box component="article" key={product._id}>
            <Box
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 2,
                bgcolor: '#eaeaea',
                boxShadow: 2,
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {product.image ? (
                <Box
                  component="img"
                  src={productImageUrl(product.image)}
                  alt={product.title}
                  loading="lazy"
                  sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography color="text.secondary">No image available</Typography>
              )}
            </Box>

            <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 1.5 }}>
              <Typography component="h2" sx={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {product.title}
              </Typography>
              {product.price != null && (
                <Typography sx={{ whiteSpace: 'nowrap' }}>
                  {currencyFormatter.format(product.price)}
                </Typography>
              )}
            </Stack>

            <Chip
              size="small"
              label={product.inStock ? 'In stock' : 'Sold out'}
              color={product.inStock ? 'success' : 'default'}
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}