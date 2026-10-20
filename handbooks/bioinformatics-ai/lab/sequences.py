"""Esercizio didattico su sequenze artificiali di piante. Nessun dato reale."""
from pathlib import Path

VALID = set("ACGTN")
COMPLEMENT = str.maketrans("ACGTN", "TGCAN")


def parse_fasta(path: str | Path) -> dict[str, str]:
    sequences: dict[str, str] = {}
    identifier = None
    pieces: list[str] = []

    def save_record() -> None:
        if identifier is None:
            return
        seq = "".join(pieces).upper()
        if not seq:
            raise ValueError(f"Sequenza vuota per {identifier}")
        if not set(seq) <= VALID:
            raise ValueError(f"Basi non riconosciute per {identifier}")
        if identifier in sequences:
            raise ValueError(f"Identificatore duplicato: {identifier}")
        sequences[identifier] = seq

    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith(">"):
            save_record()
            identifier = line[1:].strip().split()[0]
            if not identifier:
                raise ValueError("Record FASTA senza identificatore")
            pieces = []
        else:
            if identifier is None:
                raise ValueError("Sequenza prima dell'intestazione FASTA")
            pieces.append(line)
    save_record()
    return sequences


def gc_fraction(sequence: str) -> float:
    """Frazione G/C rispetto alle sole basi A,C,G,T; N esclusi."""
    sequence = sequence.upper()
    if not set(sequence) <= VALID:
        raise ValueError("Sequenza non valida")
    observed = [base for base in sequence if base != "N"]
    if not observed:
        raise ValueError("Nessuna base osservata valida")
    return sum(base in "GC" for base in observed) / len(observed)


def reverse_complement(sequence: str) -> str:
    sequence = sequence.upper()
    if not set(sequence) <= VALID:
        raise ValueError("Sequenza non valida")
    return sequence.translate(COMPLEMENT)[::-1]


if __name__ == "__main__":
    file = Path(__file__).with_name("demo_plants.fasta")
    for name, seq in parse_fasta(file).items():
        print(f"{name}: lunghezza={len(seq)} GC={gc_fraction(seq):.1%} revcomp={reverse_complement(seq)}")
