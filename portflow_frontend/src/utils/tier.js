export const NEGOTIATION_LABELS = {
  up: 'pode ficar mais caro',
  down: 'pode ficar mais barato',
  both: 'pode ficar mais caro ou mais barato',
};

export const formatTierPrice = (price) =>
  Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
