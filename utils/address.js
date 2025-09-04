const formatETHaddress = address => address.slice(0, 6) + '...' + address.slice(-4)

// Get a label for an address - can be extended to use ENS or other name services
const getAddressLabel = async (address) => {
	// For now, just return formatted address
	// In the future, this could query ENS or other name services
	return formatETHaddress(address);
}

module.exports = exports = {
	getAddressLabel,
	formatETHaddress
}