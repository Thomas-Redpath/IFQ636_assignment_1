export const productImages = [
  { filename: 'carlton_blues.jpg', label: 'Carlton Blues' },
  { filename: 'collingwood_magpies.jpg', label: 'Collingwood Magpies' },
  { filename: 'essendon_bombers.jpg', label: 'Essendon Bombers' },
  { filename: 'hawthorn_hawks.jpg', label: 'Hawthorn Hawks' },   
  { filename: 'melbourne_demons.jpg', label: 'Melbourne Demons' },
  { filename: 'melbourne_victory.jpg', label: 'Melbourne Victory' },   
  { filename: 'richmond_tigers.jpg', label: 'Richmond Tigers' },
  { filename: 'melbourne_city_fc.jpg', label: 'Melbourne City' },  
  { filename: 'st_kilda_saints.jpg', label: 'St Kilda Saints' },  
];

export const productImageUrl = (filename) =>
  `${process.env.PUBLIC_URL}/images/${encodeURIComponent(filename)}`;