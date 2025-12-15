export const mockHltbInitResponse = {
  token: 'test-hltb-auth-token-12345',
};

export const mockHltbHomepageHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>HowLongToBeat</title>
  <script src="/_next/static/chunks/pages/_app-abc123def456.js"></script>
</head>
<body>
  <div id="app">HowLongToBeat</div>
</body>
</html>
`;

export const mockHltbAppScript = `
(function() {
  // Mock app script
  fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  fetch("/api/find/12345", { method: "GET" });
})();
`;

export const mockHltbSearchResponse = {
  data: [
    {
      game_id: 10270,
      game_name: 'The Witcher 3: Wild Hunt',
      game_image: '10270_The_Witcher_3_Wild_Hunt.jpg',
      comp_main: 180000, // 50 hours in seconds
      comp_plus: 360000, // 100 hours in seconds
      comp_100: 630000, // 175 hours in seconds
      comp_all: 450000, // 125 hours average
      comp_all_count: 5000,
    },
    {
      game_id: 10271,
      game_name: 'The Witcher 3 Wild Hunt - Hearts of Stone',
      game_image: '10271_Hearts_of_Stone.jpg',
      comp_main: 36000, // 10 hours
      comp_plus: 54000, // 15 hours
      comp_100: 72000, // 20 hours
      comp_all: 54000,
      comp_all_count: 2000,
    },
    {
      game_id: 10272,
      game_name: 'Witcher: Enhanced Edition',
      game_image: '10272_Witcher.jpg',
      comp_main: 126000, // 35 hours
      comp_plus: 180000, // 50 hours
      comp_100: 270000, // 75 hours
      comp_all: 180000,
      comp_all_count: 1500,
    },
  ],
};

export const mockHltbSearchResponseNoResults = {
  data: [],
};

export const mockHltbSearchResponseSingleResult = {
  data: [
    {
      game_id: 50000,
      game_name: 'Unique Game Title',
      game_image: 'unique.jpg',
      comp_main: 72000, // 20 hours
      comp_plus: 108000, // 30 hours
      comp_100: 144000, // 40 hours
      comp_all: 108000,
      comp_all_count: 100,
    },
  ],
};

export const mockHltbSearchResponseWithAccents = {
  data: [
    {
      game_id: 60000,
      game_name: 'Pokémon Legends: Arceus',
      game_image: 'pokemon.jpg',
      comp_main: 90000, // 25 hours
      comp_plus: 144000, // 40 hours
      comp_100: 270000, // 75 hours
      comp_all: 144000,
      comp_all_count: 3000,
    },
  ],
};
