export type RoomCategory = 'background' | 'outfit' | 'accessory';
export interface RoomSelection {
  backgroundId: string;
  outfitId: string;
  accessoryId: string;
}
export interface RoomItem {
  id: string;
  category: RoomCategory;
  name: string;
  description: string;
  price: number;
  color: string;
}

export const roomPricingVersion = 1 as const;
export const roomCategoryPrices: Readonly<Record<RoomCategory, number>> = {
  background: 3_200,
  outfit: 1_600,
  accessory: 700,
};
export const premiumOutfitPrice = 1_600;

export const defaultRoom: RoomSelection = {
  backgroundId: 'mint-room',
  outfitId: 'original',
  accessoryId: 'none',
};
export const roomItems: readonly RoomItem[] = [
  {
    id: 'mint-room',
    category: 'background',
    name: '민트 공부방',
    description: '초록 화분과 햇살이 반기는 나의 방',
    price: 0,
    color: '#dff6e8',
  },
  {
    id: 'sky-garden',
    category: 'background',
    name: '하늘 정원',
    description: '구름 위 정원에서 가볍게 쉬어 가요',
    price: roomCategoryPrices.background,
    color: '#c5ecff',
  },
  {
    id: 'ocean-window',
    category: 'background',
    name: '바다 창가',
    description: '시원한 파도가 보이는 푸른 창가',
    price: roomCategoryPrices.background,
    color: '#82dce6',
  },
  {
    id: 'star-loft',
    category: 'background',
    name: '별빛 다락',
    description: '반짝이는 별 아래 포근한 작은 다락',
    price: roomCategoryPrices.background,
    color: '#9bade6',
  },
  {
    id: 'rain-library',
    category: 'background',
    name: '빗소리 서재',
    description: '빗방울이 맺힌 창과 높은 책장, 따뜻한 독서등이 있는 조용한 서재',
    price: roomCategoryPrices.background,
    color: '#a5ccd5',
  },
  {
    id: 'bamboo-hideout',
    category: 'background',
    name: '대나무 쉼터',
    description: '대나무 숲을 바라보며 낮은 찻상과 둥근 방석에서 쉬는 초록 쉼터',
    price: roomCategoryPrices.background,
    color: '#a3d5b1',
  },
  {
    id: 'cloud-cabin',
    category: 'background',
    name: '구름 오두막',
    description: '구름 사이에 떠 있는 나무 오두막, 창밖으로 작은 연이 날아가요',
    price: roomCategoryPrices.background,
    color: '#b5dff5',
  },
  {
    id: 'coral-studio',
    category: 'background',
    name: '산호 작업실',
    description: '넓은 수중 창 너머 산호와 물고기가 보이고, 그림 도구를 갖춘 작업실',
    price: roomCategoryPrices.background,
    color: '#83d3d5',
  },
  {
    id: 'moon-observatory',
    category: 'background',
    name: '달빛 천문대',
    description: '돔 지붕 아래 망원경과 별 지도가 놓인, 달빛 가득한 작은 천문대',
    price: roomCategoryPrices.background,
    color: '#8798d0',
  },
  {
    id: 'winter-chalet',
    category: 'background',
    name: '눈꽃 산장',
    description: '창밖에는 하얀 눈, 안에는 따뜻한 벽난로와 나무 바닥이 있는 산장',
    price: roomCategoryPrices.background,
    color: '#bad8e6',
  },
  {
    id: 'spring-greenhouse',
    category: 'background',
    name: '봄날 온실',
    description: '유리 지붕으로 햇빛이 쏟아지고 꽃 화분과 덩굴이 가득한 봄날의 온실',
    price: roomCategoryPrices.background,
    color: '#b9dfbb',
  },
  {
    id: 'seaside-lighthouse',
    category: 'background',
    name: '등대 다락방',
    description: '바다를 비추는 등대의 다락방, 넓은 창과 나침반, 나선 계단이 반겨요',
    price: roomCategoryPrices.background,
    color: '#a2cde1',
  },
  {
    id: 'music-studio',
    category: 'background',
    name: '파란 음악방',
    description: '건반과 스피커, 벽에 걸린 음표가 어우러진 산뜻한 파란 음악방',
    price: roomCategoryPrices.background,
    color: '#a8cbea',
  },
  {
    id: 'night-camp',
    category: 'background',
    name: '반딧불 캠프',
    description: '초록 숲속 텐트 옆으로 반딧불이 반짝이는 평화로운 밤의 캠프',
    price: roomCategoryPrices.background,
    color: '#8eb9ac',
  },
  {
    id: 'original',
    category: 'outfit',
    name: '원래 옷',
    description: '우리 친구의 가장 익숙한 모습',
    price: 0,
    color: '#30343a',
  },
  {
    id: 'blue-hoodie',
    category: 'outfit',
    name: '블루 후디',
    description: '가벼운 모험에 어울리는 하늘색 후디',
    price: roomCategoryPrices.outfit,
    color: '#42aeef',
  },
  {
    id: 'green-varsity',
    category: 'outfit',
    name: '초록 야구잠바',
    description: '크림색 소매와 초록빛의 산뜻한 조합',
    price: roomCategoryPrices.outfit,
    color: '#43b682',
  },
  {
    id: 'sailor',
    category: 'outfit',
    name: '세일러 셔츠',
    description: '푸른 리본으로 완성하는 산뜻한 셔츠',
    price: roomCategoryPrices.outfit,
    color: '#c8e9ff',
  },
  {
    id: 'navy-hoodie',
    category: 'outfit',
    name: '네이비 후드티',
    description: '작은 별 배지와 넉넉한 포켓이 있는 네이비 후드티',
    price: premiumOutfitPrice,
    color: '#284b70',
  },
  {
    id: 'sky-puffer',
    category: 'outfit',
    name: '하늘 패딩',
    description: '둥근 단추 배지와 폭신한 퀼팅의 하늘빛 패딩',
    price: premiumOutfitPrice,
    color: '#368da8',
  },
  {
    id: 'beige-trench',
    category: 'outfit',
    name: '베이지 트렌치코트',
    description: '크림색 깃과 허리 벨트가 있는 베이지 트렌치코트',
    price: premiumOutfitPrice,
    color: '#d7b88b',
  },
  {
    id: 'mint-cardigan',
    category: 'outfit',
    name: '민트 가디건',
    description: '작은 단추와 포켓이 달린 부드러운 민트 가디건',
    price: roomCategoryPrices.outfit,
    color: '#8bd4bc',
  },
  {
    id: 'denim-jacket',
    category: 'outfit',
    name: '데님 재킷',
    description: '스티치와 가슴 포켓이 돋보이는 푸른 데님 재킷',
    price: roomCategoryPrices.outfit,
    color: '#6cadd0',
  },
  {
    id: 'striped-knit',
    category: 'outfit',
    name: '스트라이프 니트',
    description: '크림 바탕에 파란 줄무늬를 넣은 포근한 니트',
    price: roomCategoryPrices.outfit,
    color: '#a7cfe1',
  },
  {
    id: 'lavender-sweater',
    category: 'outfit',
    name: '라벤더 맨투맨',
    description: '작은 구름 자수가 있는 편안한 라벤더 맨투맨',
    price: roomCategoryPrices.outfit,
    color: '#bbb7e2',
  },
  {
    id: 'raincoat',
    category: 'outfit',
    name: '레몬 레인코트',
    description: '비 오는 날에도 산뜻한 노란 후드 레인코트',
    price: roomCategoryPrices.outfit,
    color: '#f0d678',
  },
  {
    id: 'cozy-fleece',
    category: 'outfit',
    name: '크림 플리스',
    description: '보송한 크림색 원단과 초록 지퍼의 포근한 플리스',
    price: roomCategoryPrices.outfit,
    color: '#ede7ce',
  },
  {
    id: 'ribbon-dress',
    category: 'outfit',
    name: '리본 원피스',
    description: '푸른 리본과 살짝 퍼지는 치마가 있는 민트 원피스',
    price: roomCategoryPrices.outfit,
    color: '#92cdbd',
  },
  {
    id: 'none',
    category: 'accessory',
    name: '액세서리 없이',
    description: '친구의 얼굴을 그대로 만나요',
    price: 0,
    color: '#e4edf1',
  },
  {
    id: 'round-glasses',
    category: 'accessory',
    name: '동그란 안경',
    description: '새로운 이야기를 발견하는 똑똑한 안경',
    price: roomCategoryPrices.accessory,
    color: '#4c829d',
  },
  {
    id: 'star-headphones',
    category: 'accessory',
    name: '별 헤드폰',
    description: '반짝이는 별 장식이 달린 헤드폰',
    price: roomCategoryPrices.accessory,
    color: '#67cbd4',
  },
  {
    id: 'flower-crown',
    category: 'accessory',
    name: '꽃 왕관',
    description: '작은 꽃으로 엮은 나만의 왕관',
    price: roomCategoryPrices.accessory,
    color: '#f4b6c5',
  },
  {
    id: 'mint-ribbon',
    category: 'accessory',
    name: '민트 리본',
    description: '살랑이는 민트색 리본으로 오늘도 산뜻하게',
    price: roomCategoryPrices.accessory,
    color: '#79d5bd',
  },
  {
    id: 'star-hairpin',
    category: 'accessory',
    name: '별빛 머리핀',
    description: '푸른 머리핀에 작은 금빛 별이 반짝여요',
    price: roomCategoryPrices.accessory,
    color: '#82c8ef',
  },
  {
    id: 'moon-hairpin',
    category: 'accessory',
    name: '달빛 머리핀',
    description: '작은 초승달과 별이 함께하는 조용한 밤의 장식',
    price: roomCategoryPrices.accessory,
    color: '#a9b5e8',
  },
  {
    id: 'butterfly-clip',
    category: 'accessory',
    name: '나비 머리핀',
    description: '하늘색 날개를 활짝 편 나비가 살포시 앉았어요',
    price: roomCategoryPrices.accessory,
    color: '#83d9ed',
  },
  {
    id: 'daisy-pin',
    category: 'accessory',
    name: '데이지 핀',
    description: '하얀 꽃잎과 노란 꽃술, 초록 잎의 작은 꽃 한 송이',
    price: roomCategoryPrices.accessory,
    color: '#dcebc0',
  },
  {
    id: 'pearl-headband',
    category: 'accessory',
    name: '진주 머리띠',
    description: '푸른 머리띠를 따라 동그란 진주가 반짝여요',
    price: roomCategoryPrices.accessory,
    color: '#c3e1f1',
  },
  {
    id: 'heart-sunglasses',
    category: 'accessory',
    name: '하트 선글라스',
    description: '눈빛이 살짝 비치는 민트색 하트 선글라스',
    price: roomCategoryPrices.accessory,
    color: '#6fcbbd',
  },
  {
    id: 'mint-scarf',
    category: 'accessory',
    name: '민트 스카프',
    description: '작은 매듭과 밝은 줄무늬가 있는 포근한 스카프',
    price: roomCategoryPrices.accessory,
    color: '#7ed7c6',
  },
  {
    id: 'lucky-clover',
    category: 'accessory',
    name: '행운의 클로버',
    description: '네 잎에 작은 행운을 담은 초록 클로버 장식',
    price: roomCategoryPrices.accessory,
    color: '#79c991',
  },
  {
    id: 'blue-beret',
    category: 'accessory',
    name: '하늘 베레모',
    description: '작은 별 배지가 달린 부드러운 하늘색 베레모',
    price: roomCategoryPrices.accessory,
    color: '#78bde8',
  },
];
export function getRoomItem(id: string) {
  return roomItems.find((item) => item.id === id);
}
export function roomSlot(category: RoomCategory): keyof RoomSelection {
  return category === 'background'
    ? 'backgroundId'
    : category === 'outfit'
      ? 'outfitId'
      : 'accessoryId';
}
export const freeRoomItemIds = roomItems.filter((item) => item.price === 0).map((item) => item.id);
