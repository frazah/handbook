from pathlib import Path
import unittest
from sequences import parse_fasta, gc_fraction, reverse_complement
from surveillance_demo import read_rows, review_candidates

DIR = Path(__file__).parent


class SequenceTests(unittest.TestCase):
    def test_parsing(self):
        records = parse_fasta(DIR / 'demo_plants.fasta')
        self.assertEqual(len(records), 3)
        self.assertEqual(records['foglia_a_simulata'], 'ACGTACGTAA')

    def test_gc_fraction_and_unknown_bases(self):
        self.assertAlmostEqual(gc_fraction('GCAA'), 0.5)
        self.assertAlmostEqual(gc_fraction('GCNN'), 1.0)
        with self.assertRaises(ValueError):
            gc_fraction('NNNN')

    def test_reverse_complement(self):
        self.assertEqual(reverse_complement('AAGTN'), 'NACTT')


class SignalsTests(unittest.TestCase):
    def test_rate_and_flag(self):
        rows = read_rows(DIR / 'synthetic_signals.csv')
        result = review_candidates(rows)
        flagged = [(r['site'], r['week']) for r in result if r['review_candidate']]
        self.assertEqual(flagged, [('Valle', '2026-W05')])

    def test_bad_completeness_is_not_flagged(self):
        result = review_candidates(read_rows(DIR / 'synthetic_signals.csv'))
        incomplete = next(r for r in result if r['week'] == '2026-W06' and r['site'] == 'Valle')
        self.assertFalse(incomplete['review_candidate'])


if __name__ == '__main__':
    unittest.main()
