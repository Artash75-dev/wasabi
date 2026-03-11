const SYSTEM_LINE_PATTERNS = [
  /^Промо-код\s*-/i,
  /^Тип доставки\s*-/i,
  /^Для клиента$/i,
  /^Количество палочки\s*-/i,
  /^Количество клиентов\s*-/i,
  /^Тип платежа$/i,
  /^\d+(?:[.,]\d+)?\s*сум\s+(?:наличными|картой|бонус|сертификат)$/i,
  /^\d+(?:[.,]\d+)?\s*сум\s+(?:PayMe|Click)$/i,
  /^Оплата\s+(?:наличными|картой),?\s*$/i,
  /^Бонус:\s*.+$/i,
];

const normalizeLine = (value = "") => value.replace(/\s+/g, " ").trim();
const normalizeBlock = (value = "") => value.replace(/\s+/g, " ").trim();

const isSystemLine = (line, clientAddressComment) => {
  const normalizedLine = normalizeLine(line);
  const normalizedAddressComment = normalizeLine(clientAddressComment);

  if (!normalizedLine) {
    return false;
  }

  if (
    normalizedAddressComment &&
    normalizedLine === normalizedAddressComment
  ) {
    return true;
  }

  return SYSTEM_LINE_PATTERNS.some((pattern) => pattern.test(normalizedLine));
};

export const extractManualOrderComment = (
  comment = "",
  clientAddressComment = ""
) => {
  if (!comment) {
    return "";
  }

  const lines = comment
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !isSystemLine(line, clientAddressComment));

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

export const buildOrderComment = ({
  manualComment = "",
  clientAddressComment = "",
  serviceName = "",
  promocode = "",
  stickCount,
  persNum,
  payCash,
  payCard,
  payPayme,
  payClick,
  payBonus,
  payCertificate,
}) => {
  const manualSection = [];
  const normalizedManualComment = manualComment.trim();
  const normalizedClientAddressComment = clientAddressComment.trim();

  if (normalizedManualComment) {
    manualSection.push(normalizedManualComment);
  }

  if (
    normalizedClientAddressComment &&
    !normalizeBlock(normalizedManualComment).includes(
      normalizeBlock(normalizedClientAddressComment)
    )
  ) {
    manualSection.push(normalizedClientAddressComment);
  }

  const serviceSection = [];

  if (serviceName) {
    serviceSection.push(`Тип доставки - ${serviceName}`);
  }
  if (promocode) {
    serviceSection.push(`Промо-код - ${promocode}`);
  }
  if ((stickCount && Number(stickCount) !== 0) || (persNum && Number(persNum) !== 0)) {
    serviceSection.push("Для клиента");
  }
  if (stickCount && Number(stickCount) !== 0) {
    serviceSection.push(`Количество палочки - ${stickCount}`);
  }
  if (persNum && Number(persNum) !== 0) {
    serviceSection.push(`Количество клиентов - ${persNum}`);
  }

  const paymentLines = [];

  if (
    payCash ||
    payCard ||
    payPayme ||
    payClick ||
    payBonus ||
    payCertificate
  ) {
    paymentLines.push("Тип платежа");
  }
  if (payCash) {
    paymentLines.push(`${payCash} сум наличными`);
  }
  if (payCard) {
    paymentLines.push(`${payCard} сум картой`);
  }
  if (payPayme) {
    paymentLines.push(`${payPayme} сум PayMe`);
  }
  if (payClick) {
    paymentLines.push(`${payClick} сум Click`);
  }
  if (payBonus) {
    paymentLines.push(`${payBonus} сум бонус`);
  }
  if (payCertificate) {
    paymentLines.push(`${payCertificate} сум сертификат`);
  }

  return [manualSection.join("\n"), serviceSection.join("\n"), paymentLines.join("\n")]
    .filter(Boolean)
    .join("\n\n")
    .trim();
};
