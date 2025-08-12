const Logo = ({ collapsed }) => {
  return (
    <div
      style={{
        height: 64,
        margin: 16,
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: collapsed ? '14px' : '16px',
        transition: 'all 0.2s',
      }}
    >
      {collapsed ? 'MM' : 'MeterManager'}
    </div>
  );
};

export default Logo;
