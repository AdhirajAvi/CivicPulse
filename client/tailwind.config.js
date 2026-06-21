export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          civic: '#0B7285'
        },
        ink: '#1A2B33',
        saffron: '#F59E0B',
        canvas: '#FAFAFA'
      },
      boxShadow: {
        civic: '0 18px 60px rgba(26, 43, 51, 0.14)'
      }
    }
  },
  plugins: []
};
