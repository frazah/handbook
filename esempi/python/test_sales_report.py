from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from sales_report import summarize

class SalesTests(unittest.TestCase):
    def test_paid_only(self):
        with TemporaryDirectory() as folder:
            path = Path(folder) / 'data.csv'
            path.write_text('customer,total_cents,status\nAda,1200,paid\nAda,800,pending\n', encoding='utf-8')
            self.assertEqual(summarize(path), [{'customer': 'Ada', 'total_cents': 1200}])

if __name__ == '__main__':
    unittest.main()
