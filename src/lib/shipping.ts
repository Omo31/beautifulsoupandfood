export type LgaShippingZone = {
  id: string;
  name: string;
  price: number;
};

// This data is now only a fallback for the Custom Order page.
// The cart page will only use data from Firestore settings.
export const lagosLgas: LgaShippingZone[] = [
  { id: 'agege', name: 'Agege', price: 1500 },
  { id: 'ajeromi-ifelodun', name: 'Ajeromi-Ifelodun', price: 2000 },
  { id: 'alimosho', name: 'Alimosho', price: 1800 },
  { id: 'amuwo-odofin', name: 'Amuwo-Odofin', price: 2200 },
  { id: 'apapa', name: 'Apapa', price: 2500 },
  { id: 'badagry', name: 'Badagry', price: 3500 },
  { id: 'epe', name: 'Epe', price: 4000 },
  { id: 'eti-osa', name: 'Eti-Osa', price: 2800 },
  { id: 'ibeju-lekki', name: 'Ibeju-Lekki', price: 3200 },
  { id: 'ifako-ijaiye', name: 'Ifako-Ijaiye', price: 1600 },
  { id: 'ikeja', name: 'Ikeja', price: 1200 },
  { id: 'ikorodu', name: 'Ikorodu', price: 3000 },
  { id: 'kosofe', name: 'Kosofe', price: 1500 },
  { id: 'lagos-island', name: 'Lagos Island', price: 2500 },
  { id: 'lagos-mainland', name: 'Lagos Mainland', price: 1800 },
  { id: 'mushin', name: 'Mushin', price: 1700 },
  { id: 'ojo', name: 'Ojo', price: 2800 },
  { id: 'oshodi-isolo', name: 'Oshodi-Isolo', price: 1600 },
  { id: 'shomolu', name: 'Shomolu', price: 1700 },
  { id: 'surulere', name: 'Surulere', price: 1500 },
];
