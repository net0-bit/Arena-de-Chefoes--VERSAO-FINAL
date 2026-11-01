/**
 * MODELO INICIAL - É AQUI QUE A EQUIPE VAI PROGRAMAR AS REGRAS DO JOGO.
 * A comunicação HTTP já está pronta em ServidorArena.java.
 */
import java.util.Random;

public class Batalha {
    private static final int VIDA_MAX_JOGADOR = 100;
    private static final int VIDA_MAX_CHEFE = 150;
    private static final int LIMITE_FURIA = 75;
    private static final int BONUS_FURIA = 6;

    private final Random random = new Random();

    private int vidaJogador = VIDA_MAX_JOGADOR;
    private int vidaChefe = VIDA_MAX_CHEFE;
    private int pocoes = 2;
    private int turno = 1;
    private boolean encerrado = false;
    private String resultado = "em_andamento";
    private String mensagem = "Apita o árbitro! Escolha sua primeira jogada.";

    public synchronized String agir(String acao) {
        if (encerrado) {
            mensagem = "A partida já terminou. Comece uma nova partida.";
            return estadoJson();
        }

        boolean defendendo = false;
        String textoAcao;
        switch (acao) {
            case "atacar":
                vidaChefe = Math.max(0, vidaChefe - sortear(18, 25));
                textoAcao = "O Timão partiu pro ataque e finalizou!";
                break;
            case "defender":
                defendendo = true;
                textoAcao = "O Timão fechou a defesa e povoou a área.";
                break;
            case "curar":
                if (pocoes <= 0) {
                    mensagem = "O massagista não tem mais material! Escolha outra jogada.";
                    return estadoJson();
                }
                if (vidaJogador >= VIDA_MAX_JOGADOR) {
                    mensagem = "O time está inteiro, sem necessidade de massagista! Escolha outra jogada.";
                    return estadoJson();
                }
                vidaJogador = Math.min(VIDA_MAX_JOGADOR, vidaJogador + sortear(26, 34));
                pocoes--;
                textoAcao = "O massagista entrou em campo e o Timão se recuperou.";
                break;
            default:
                mensagem = "Jogada inválida.";
                return estadoJson();
        }

        if (vidaChefe <= 0) {
            encerrado = true;
            resultado = "vitoria";
            mensagem = textoAcao + " GOOOOL! O adversário caiu! VITÓRIA do Timão!";
            return estadoJson();
        }

        boolean especial = (turno % 3 == 0);
        int dano = especial ? sortear(32, 42) : sortear(11, 17);
        boolean furia = emFuria();
        if (furia) dano += BONUS_FURIA;
        if (defendendo) dano = Math.max(1, dano / 4);
        vidaJogador = Math.max(0, vidaJogador - dano);

        String tipo = especial ? "uma jogada ensaiada ESPECIAL" : "um contra-ataque comum";
        mensagem = textoAcao + " O adversário respondeu com " + tipo + (furia ? ", pressionando muito." : ".");

        if (vidaJogador <= 0) {
            encerrado = true;
            resultado = "derrota";
            mensagem += " Fim de jogo... o Timão foi derrotado.";
        } else {
            turno++;
        }
        return estadoJson();
    }

    public synchronized String reiniciar() {
        vidaJogador = VIDA_MAX_JOGADOR;
        vidaChefe = VIDA_MAX_CHEFE;
        pocoes = 2;
        turno = 1;
        encerrado = false;
        resultado = "em_andamento";
        mensagem = "Nova partida! Bola rolando.";
        return estadoJson();
    }

    private int sortear(int min, int max) {
        return min + random.nextInt(max - min + 1);
    }

    private boolean emFuria() {
        return vidaChefe <= LIMITE_FURIA;
    }

    private String avisoProximoTurno() {
        if (encerrado) return "Partida encerrada.";
        if (turno % 3 == 0) {
            return "⚠️ ATENÇÃO! O próximo contra-ataque será ESPECIAL (jogada ensaiada)!";
        }
        return "Próximo contra-ataque: COMUM.";
    }

    public synchronized String estadoJson() {
        return "{" +
            "\"jogadorVida\":" + vidaJogador + "," +
            "\"jogadorMax\":" + VIDA_MAX_JOGADOR + "," +
            "\"chefeVida\":" + vidaChefe + "," +
            "\"chefeMax\":" + VIDA_MAX_CHEFE + "," +
            "\"pocoes\":" + pocoes + "," +
            "\"turno\":" + turno + "," +
            "\"encerrado\":" + encerrado + "," +
            "\"furia\":" + emFuria() + "," +
            "\"resultado\":\"" + escapar(resultado) + "\"," +
            "\"mensagem\":\"" + escapar(mensagem) + "\"," +
            "\"aviso\":\"" + escapar(avisoProximoTurno()) + "\"" +
            "}";
    }

    private String escapar(String texto) {
        return texto.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
    }
}