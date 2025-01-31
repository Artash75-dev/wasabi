import useSound from "use-sound";

const useAudio = () => {
  const [play1] = useSound("/audios/notification.mp3");

  const playSound = (sound) => {
    switch (sound) {
      case "notification.mp3":
        play1();
        break;
      default:
    }
  };

  return { playSound };
};

export default useAudio;
