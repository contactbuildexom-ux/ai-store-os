export function calculateDeliveryFee(customerCity: string, storeCity: string = "Lahore", cityRate: number = 200, otherCityRate: number = 350): number {
  // Agar customer ka city store ke city se match kare (case-insensitive), toh local city rate lagega
  if (customerCity.trim().toLowerCase() === storeCity.trim().toLowerCase()) {
    return cityRate;
  }
  // Agar kisi aur city ka order ho, toh other city rate lagega
  return otherCityRate;
}