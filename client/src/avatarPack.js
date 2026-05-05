// Unique VentItOut Postman Avatar Pack
// Each avatar is a cartoonish postman in a different genre
// Displayed as emoji-style icons with unique labels

const AVATAR_PACK = [
  { id: "classic",     emoji: "📮", label: "Classic Postman",        color: "#E8739A" },
  { id: "kpop",        emoji: "🎤", label: "K-Pop Idol",             color: "#B388FF" },
  { id: "anime",       emoji: "⚡", label: "Anime Hero",             color: "#FF6B6B" },
  { id: "bollywood",   emoji: "🎬", label: "Bollywood Star",         color: "#FFB74D" },
  { id: "hollywood",   emoji: "🎥", label: "Hollywood Celeb",        color: "#4FC3F7" },
  { id: "hoodrapper",  emoji: "🔥", label: "Hood Rapper",            color: "#7C4DFF" },
  { id: "londonrap",   emoji: "🇬🇧", label: "London Grime MC",       color: "#26A69A" },
  { id: "cowboy",      emoji: "🤠", label: "Cowboy Postman",         color: "#8D6E63" },
  { id: "samurai",     emoji: "⚔️", label: "Samurai",                color: "#EF5350" },
  { id: "astronaut",   emoji: "🚀", label: "Space Explorer",         color: "#1E88E5" },
  { id: "pirate",      emoji: "🏴‍☠️", label: "Pirate Postman",        color: "#424242" },
  { id: "steampunk",   emoji: "⚙️", label: "Steampunk",              color: "#795548" },
];

export default AVATAR_PACK;

// Get avatar by ID
export const getAvatar = (id) => {
  return AVATAR_PACK.find(a => a.id === id) || AVATAR_PACK[0];
};

// Render an avatar circle (emoji inside colored bg)
export const renderAvatarStyle = (avatarId, size = 44) => {
  const avatar = getAvatar(avatarId);
  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${avatar.color}22, ${avatar.color}44)`,
    border: `2px solid ${avatar.color}66`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.45,
    flexShrink: 0,
  };
};
