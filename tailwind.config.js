module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'fly-asteroid': 'fly-asteroid linear infinite',
      },
      keyframes: {
        'fly-asteroid': {
          '0%': {
            transform: 'translateX(-100vw) translateY(-100vh)',
          },
          '100%': {
            transform: 'translateX(100vw) translateY(100vh)',
          },
        },
      },
    },
  },
};
