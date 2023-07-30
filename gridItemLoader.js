const ItemLoader = (Component) => ({ ...props }) => {
    let helper = Component.Helper ? new Component.Helper(props) : {};
    return <Component helper={helper} {...props} />;
};

export default ItemLoader;