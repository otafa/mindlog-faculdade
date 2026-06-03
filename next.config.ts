import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O indicador de dev fica, por padrão, no canto inferior esquerdo — o mesmo lugar
  // do "Sair" na sidebar. Movido para a direita para não cobrir a navegação.
  // (Só aparece em desenvolvimento; some no build.)
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
