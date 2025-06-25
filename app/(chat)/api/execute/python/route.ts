import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      );
    }

    // Create a temporary file for the Python code
    const tempId = nanoid();
    const tempFile = join('/tmp', `python_${tempId}.py`);
    
    await writeFile(tempFile, code);

    return new Promise((resolve) => {
      const python = spawn('python3', [tempFile], {
        timeout: 10000, // 10 second timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', async (code) => {
        // Clean up temp file
        try {
          await unlink(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            output: stdout,
            error: stderr || null
          }));
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            output: stdout,
            error: stderr || 'Python execution failed'
          }));
        }
      });

      python.on('error', async (error) => {
        // Clean up temp file
        try {
          await unlink(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        resolve(NextResponse.json({ 
          success: false, 
          output: '',
          error: `Execution error: ${error.message}`
        }, { status: 500 }));
      });

      // Handle timeout
      setTimeout(() => {
        python.kill('SIGKILL');
        resolve(NextResponse.json({ 
          success: false, 
          output: stdout,
          error: 'Execution timed out (10 seconds)'
        }, { status: 408 }));
      }, 10000);
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
