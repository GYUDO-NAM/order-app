import type { MenuItem } from '../types';

export const menuData: MenuItem[] = [
  {
    id: 'americano-ice',
    name: '아메리카노(ICE)',
    price: 4000,
    description: '신선한 에스프레소에 차가운 물을 더한 시원한 아메리카노입니다.',
    image: '',
    stock: 10,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'americano-hot',
    name: '아메리카노(HOT)',
    price: 4000,
    description: '진한 에스프레소와 뜨거운 물이 만나는 따뜻한 아메리카노입니다.',
    image: '',
    stock: 10,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'caffe-latte',
    name: '카페라떼',
    price: 5000,
    description: '부드러운 스팀밀크와 에스프레소가 조화로운 카페라떼입니다.',
    image: '',
    stock: 8,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'cappuccino',
    name: '카푸치노',
    price: 5000,
    description: '에스프레소, 스팀밀크, 풍성한 우유 거품이 층층이 쌓인 카푸치노입니다.',
    image: '',
    stock: 6,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 'vanilla-latte',
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 향과 부드러운 라떼가 어우러진 인기 메뉴입니다.',
    image: '',
    stock: 7,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
      { id: 'vanilla-extra', name: '바닐라 시럽 추가', price: 300 },
    ],
  },
  {
    id: 'cold-brew',
    name: '콜드브루',
    price: 5500,
    description: '저온에서 장시간 추출한 부드럽고 깊은 풍미의 콜드브루입니다.',
    image: '',
    stock: 0,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 },
    ],
  },
];
