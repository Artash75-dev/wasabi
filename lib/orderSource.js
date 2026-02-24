export const BOT_LIKE_SOURCES = ["bot", "website", "mobile"];

export const BOT_LIKE_CREATING_SOURCES = BOT_LIKE_SOURCES.map(
  (source) => `${source}-creating`
);

export const isBotLikeSource = (status) => BOT_LIKE_SOURCES.includes(status);

export const isBotLikeCreatingSource = (status) =>
  BOT_LIKE_CREATING_SOURCES.includes(status);

export const getCreatingStatus = (status) =>
  isBotLikeSource(status) ? `${status}-creating` : "created";

export const getSourceTitle = (status) => {
  switch (status) {
    case "bot":
      return "Через бота";
    case "website":
      return "Через сайт";
    case "mobile":
      return "Через мобильное приложение";
    default:
      return "Через админ";
  }
};
